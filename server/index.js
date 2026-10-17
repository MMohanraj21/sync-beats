import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Static files for uploaded audio
app.use('/uploads', express.static(uploadDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.mp3';
    cb(null, `audio-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.originalname.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'));
    }
  }
});

// MP3 Upload endpoint
app.post('/api/upload-mp3', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  const cleanTitle = path.basename(req.file.originalname, path.extname(req.file.originalname))
    .replace(/[_-]/g, ' ');

  const track = {
    id: `mp3-${Date.now()}`,
    source: 'mp3',
    title: cleanTitle || 'Uploaded Track',
    artist: 'Local Audio',
    url: `/uploads/${req.file.filename}`,
    fileName: req.file.filename,
    size: req.file.size
  };

  res.json({ success: true, track });
});

// YouTube In-App Search endpoint (No API key needed)
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`;
    const response = await fetch(ytUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });

    const html = await response.text();
    const match = html.match(/var ytInitialData = ({.*?});<\/script>/s) || html.match(/ytInitialData\s*=\s*({.+?});/);

    if (!match) {
      return res.json({ results: [] });
    }

    const data = JSON.parse(match[1]);
    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];

    const results = [];
    for (const item of contents) {
      const v = item.videoRenderer;
      if (v && v.videoId) {
        // Parse approximate duration in seconds
        const durText = v.lengthText?.simpleText || '3:30';
        const parts = durText.split(':').map(Number);
        let durSec = 210;
        if (parts.length === 2) durSec = parts[0] * 60 + parts[1];
        else if (parts.length === 3) durSec = parts[0] * 3600 + parts[1] * 60 + parts[2];

        // Best thumbnail
        const thumbs = v.thumbnail?.thumbnails || [];
        const thumbUrl = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`;

        results.push({
          id: `yt-${v.videoId}`,
          source: 'youtube',
          videoId: v.videoId,
          trackId: v.videoId,
          title: v.title?.runs?.[0]?.text || 'Unknown Song',
          artist: v.ownerText?.runs?.[0]?.text || 'YouTube Artist',
          duration: durSec,
          durationFormatted: durText,
          cover: thumbUrl,
          url: `https://www.youtube.com/watch?v=${v.videoId}`
        });

        if (results.length >= 15) break;
      }
    }

    res.json({ results });
  } catch (err) {
    console.error('YouTube search error:', err);
    res.status(500).json({ error: 'Failed to search YouTube', details: err.message });
  }
});

// Production: serve built static files if exists
const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads') && !req.path.startsWith('/socket.io')) {
      res.sendFile(path.join(distDir, 'index.html'));
    }
  });
}

// ----------------- ROOMS & REALTIME SYNC -----------------

// Room State Structure:
// rooms.get(roomId) = {
//   roomId,
//   currentTrack: { source: 'youtube'|'mp3'|'spotify', title, artist, url, trackId, duration },
//   isPlaying: boolean,
//   currentTime: number (in seconds),
//   lastUpdated: timestamp (ms),
//   queue: [],
//   users: Map(socketId => { username, avatar, isHost }),
//   messages: []
// }
const rooms = new Map();

function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      roomId,
      currentTrack: {
        source: 'youtube',
        title: 'Starboy (Official Audio)',
        artist: 'The Weeknd ft. Daft Punk',
        url: 'https://www.youtube.com/watch?v=34Na4j8AVgA',
        trackId: '34Na4j8AVgA',
        duration: 230,
        cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80'
      },
      isPlaying: false,
      currentTime: 0,
      lastUpdated: Date.now(),
      queue: [],
      users: new Map(),
      messages: []
    });
  }
  return rooms.get(roomId);
}

function calculateCurrentTime(room) {
  if (!room.isPlaying) return room.currentTime;
  const elapsed = (Date.now() - room.lastUpdated) / 1000;
  return room.currentTime + elapsed;
}

function serializeRoom(room) {
  return {
    roomId: room.roomId,
    currentTrack: room.currentTrack,
    isPlaying: room.isPlaying,
    currentTime: calculateCurrentTime(room),
    lastUpdated: room.lastUpdated,
    queue: room.queue,
    users: Array.from(room.users.values()),
    messages: room.messages.slice(-50)
  };
}

io.on('connection', (socket) => {
  let currentRoomId = null;
  let currentUser = null;

  socket.on('join-room', ({ roomId, username, avatar }) => {
    currentRoomId = roomId;
    const room = getOrCreateRoom(roomId);

    currentUser = {
      id: socket.id,
      username: username || `Guest #${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: avatar || '🎵',
      isHost: room.users.size === 0,
      joinedAt: Date.now()
    };

    room.users.set(socket.id, currentUser);
    socket.join(roomId);

    // Send full current state to joining user
    socket.emit('init-state', serializeRoom(room));

    // Notify others
    socket.to(roomId).emit('user-joined', {
      user: currentUser,
      users: Array.from(room.users.values())
    });

    // Add system notification message
    const joinMsg = {
      id: `sys-${Date.now()}`,
      sender: 'System',
      isSystem: true,
      text: `${currentUser.username} joined the vibe`,
      timestamp: Date.now()
    };
    room.messages.push(joinMsg);
    io.to(roomId).emit('new-chat', joinMsg);
  });

  // Play Event
  socket.on('sync-play', ({ roomId, currentTime }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.isPlaying = true;
    if (typeof currentTime === 'number') {
      room.currentTime = currentTime;
    }
    room.lastUpdated = Date.now();

    io.to(roomId).emit('sync-play', {
      currentTime: room.currentTime,
      timestamp: room.lastUpdated,
      triggeredBy: currentUser?.username
    });
  });

  // Pause Event
  socket.on('sync-pause', ({ roomId, currentTime }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.isPlaying = false;
    if (typeof currentTime === 'number') {
      room.currentTime = currentTime;
    }
    room.lastUpdated = Date.now();

    io.to(roomId).emit('sync-pause', {
      currentTime: room.currentTime,
      timestamp: room.lastUpdated,
      triggeredBy: currentUser?.username
    });
  });

  // Seek Event
  socket.on('sync-seek', ({ roomId, currentTime }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.currentTime = currentTime;
    room.lastUpdated = Date.now();

    io.to(roomId).emit('sync-seek', {
      currentTime: room.currentTime,
      timestamp: room.lastUpdated,
      triggeredBy: currentUser?.username
    });
  });

  // Change Track
  socket.on('change-track', ({ roomId, track }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.currentTrack = track;
    room.currentTime = 0;
    room.isPlaying = true;
    room.lastUpdated = Date.now();

    io.to(roomId).emit('track-changed', {
      track: room.currentTrack,
      currentTime: 0,
      isPlaying: true,
      timestamp: room.lastUpdated,
      triggeredBy: currentUser?.username
    });

    const sysMsg = {
      id: `sys-${Date.now()}`,
      sender: 'System',
      isSystem: true,
      text: `${currentUser?.username || 'Someone'} changed track to: ${track.title}`,
      timestamp: Date.now()
    };
    room.messages.push(sysMsg);
    io.to(roomId).emit('new-chat', sysMsg);
  });

  // Add to Queue
  socket.on('add-to-queue', ({ roomId, track }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.queue.push({ ...track, addedBy: currentUser?.username });
    io.to(roomId).emit('queue-updated', room.queue);

    const sysMsg = {
      id: `sys-${Date.now()}`,
      sender: 'System',
      isSystem: true,
      text: `${currentUser?.username || 'Someone'} added "${track.title}" to queue`,
      timestamp: Date.now()
    };
    room.messages.push(sysMsg);
    io.to(roomId).emit('new-chat', sysMsg);
  });

  // Remove from Queue
  socket.on('remove-from-queue', ({ roomId, index }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    if (index >= 0 && index < room.queue.length) {
      room.queue.splice(index, 1);
      io.to(roomId).emit('queue-updated', room.queue);
    }
  });

  // Play next from Queue
  socket.on('play-next', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || room.queue.length === 0) return;

    const nextTrack = room.queue.shift();
    room.currentTrack = nextTrack;
    room.currentTime = 0;
    room.isPlaying = true;
    room.lastUpdated = Date.now();

    io.to(roomId).emit('track-changed', {
      track: room.currentTrack,
      currentTime: 0,
      isPlaying: true,
      timestamp: room.lastUpdated,
      triggeredBy: currentUser?.username
    });
    io.to(roomId).emit('queue-updated', room.queue);
  });

  // Chat message
  socket.on('send-chat', ({ roomId, text }) => {
    const room = rooms.get(roomId);
    if (!room || !text || !text.trim()) return;

    const chatMsg = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: currentUser?.username || 'Guest',
      avatar: currentUser?.avatar || '👤',
      text: text.trim(),
      timestamp: Date.now()
    };

    room.messages.push(chatMsg);
    io.to(roomId).emit('new-chat', chatMsg);
  });

  // Floating Emoji Reaction
  socket.on('send-reaction', ({ roomId, emoji }) => {
    io.to(roomId).emit('floating-reaction', {
      id: `react-${Date.now()}-${Math.random()}`,
      emoji,
      sender: currentUser?.username || 'Friend',
      timestamp: Date.now()
    });
  });

  // Client requests sync calibration
  socket.on('request-sync', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    socket.emit('sync-calibration', {
      currentTime: calculateCurrentTime(room),
      isPlaying: room.isPlaying,
      timestamp: Date.now()
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (currentRoomId && rooms.has(currentRoomId)) {
      const room = rooms.get(currentRoomId);
      room.users.delete(socket.id);

      io.to(currentRoomId).emit('user-left', {
        userId: socket.id,
        username: currentUser?.username,
        users: Array.from(room.users.values())
      });

      // If room is empty, clean it up after 1 hour
      if (room.users.size === 0) {
        setTimeout(() => {
          if (rooms.has(currentRoomId) && rooms.get(currentRoomId).users.size === 0) {
            rooms.delete(currentRoomId);
          }
        }, 60 * 60 * 1000);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`[SyncBeats Server] running on http://localhost:${PORT}`);
});

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Plus,
  Share2,
  ListMusic,
  MessageSquare,
  Sparkles,
  Wifi,
  ExternalLink,
  Heart,
  Flame,
  Radio,
  Disc3,
  Youtube,
  Music
} from 'lucide-react';

import Header from './components/Header';
import AudioVisualizer from './components/AudioVisualizer';
import FloatingReactions from './components/FloatingReactions';
import YouTubePlayer from './components/YouTubePlayer';
import Mp3Player from './components/Mp3Player';
import SpotifyPlayer from './components/SpotifyPlayer';
import ChatDrawer from './components/ChatDrawer';
import QueueModal from './components/QueueModal';
import AddTrackModal from './components/AddTrackModal';

// Random cute room id generator
function generateRoomId() {
  const vibes = ['chill', 'vibe', 'melodies', 'love', 'groove', 'night', 'beats'];
  const randomVibe = vibes[Math.floor(Math.random() * vibes.length)];
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${randomVibe}-${randomNum}`;
}

export default function App() {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Playback state
  const [currentTrack, setCurrentTrack] = useState({
    id: 'yt-default',
    source: 'youtube',
    title: 'Starboy (Official Audio)',
    artist: 'The Weeknd ft. Daft Punk',
    url: 'https://www.youtube.com/watch?v=34Na4j8AVgA',
    trackId: '34Na4j8AVgA',
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80',
    duration: 230
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(230);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  // Room metadata
  const [users, setUsers] = useState([]);
  const [queue, setQueue] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reactions, setReactions] = useState([]);

  // Modals & Drawers
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Local interaction debounce
  const isLocalAction = useRef(false);

  // Initialize Room and Socket Connection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    const selectedRoom = roomFromUrl || generateRoomId();
    setRoomId(selectedRoom);

    // Update URL without reloading
    if (!roomFromUrl) {
      window.history.replaceState({}, '', `?room=${selectedRoom}`);
    }

    // Default username from localStorage or generate
    const savedName = localStorage.getItem('syncbeats_username');
    const defaultUser = savedName || `Listener_${Math.floor(10 + Math.random() * 89)}`;
    setUsername(defaultUser);

    // Initialize Socket
    const newSocket = io({
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-room', {
        roomId: selectedRoom,
        username: defaultUser,
        avatar: '🎧'
      });
    });

    newSocket.on('init-state', (state) => {
      if (state.currentTrack) setCurrentTrack(state.currentTrack);
      setIsPlaying(state.isPlaying);
      if (typeof state.currentTime === 'number') setCurrentTime(state.currentTime);
      if (state.queue) setQueue(state.queue);
      if (state.users) setUsers(state.users);
      if (state.messages) setMessages(state.messages);
    });

    newSocket.on('user-joined', ({ users }) => {
      setUsers(users);
    });

    newSocket.on('user-left', ({ users }) => {
      setUsers(users);
    });

    // Remote playback actions
    newSocket.on('sync-play', ({ currentTime: remoteTime }) => {
      if (isLocalAction.current) return;
      if (typeof remoteTime === 'number') setCurrentTime(remoteTime);
      setIsPlaying(true);
    });

    newSocket.on('sync-pause', ({ currentTime: remoteTime }) => {
      if (isLocalAction.current) return;
      if (typeof remoteTime === 'number') setCurrentTime(remoteTime);
      setIsPlaying(false);
    });

    newSocket.on('sync-seek', ({ currentTime: remoteTime }) => {
      if (isLocalAction.current) return;
      setCurrentTime(remoteTime);
    });

    newSocket.on('track-changed', ({ track, isPlaying: remotePlaying, currentTime: remoteTime }) => {
      setCurrentTrack(track);
      setIsPlaying(remotePlaying);
      setCurrentTime(remoteTime || 0);
    });

    newSocket.on('queue-updated', (newQueue) => {
      setQueue(newQueue);
    });

    newSocket.on('new-chat', (message) => {
      setMessages((prev) => [...prev, message]);
      setUnreadChatCount((prev) => (isChatOpen ? 0 : prev + 1));
    });

    newSocket.on('floating-reaction', (reaction) => {
      const reactionWithPos = {
        ...reaction,
        x: 20 + Math.random() * 60 // Random spread across center of screen
      };
      setReactions((prev) => [...prev, reactionWithPos]);

      // Remove after 3.2s
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 3200);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Playback Control Handlers
  const handleTogglePlay = () => {
    if (!socket) return;
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    isLocalAction.current = true;
    if (nextState) {
      socket.emit('sync-play', { roomId, currentTime });
    } else {
      socket.emit('sync-pause', { roomId, currentTime });
    }
    setTimeout(() => {
      isLocalAction.current = false;
    }, 500);
  };

  const handleSeek = (newTime) => {
    setCurrentTime(newTime);
    if (!socket) return;

    isLocalAction.current = true;
    socket.emit('sync-seek', { roomId, currentTime: newTime });
    setTimeout(() => {
      isLocalAction.current = false;
    }, 500);
  };

  const handleTrackChange = (newTrack) => {
    if (!socket) return;
    socket.emit('change-track', { roomId, track: newTrack });
  };

  const handleAddToQueue = (track) => {
    if (!socket) return;
    socket.emit('add-to-queue', { roomId, track });
  };

  const handleRemoveFromQueue = (index) => {
    if (!socket) return;
    socket.emit('remove-from-queue', { roomId, index });
  };

  const handlePlayNext = () => {
    if (!socket) return;
    socket.emit('play-next', { roomId });
  };

  const handleSendChat = (text) => {
    if (!socket) return;
    socket.emit('send-chat', { roomId, text });
  };

  const handleSendReaction = (emoji) => {
    if (!socket) return;
    socket.emit('send-reaction', { roomId, emoji });
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans select-none overflow-x-hidden">
      {/* Aurora Ambient Background Glow */}
      <div className="aurora-bg">
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />
        <div className="aurora-orb-3" />
      </div>

      {/* Floating Reactions Container */}
      <FloatingReactions reactions={reactions} />

      {/* Apple Glass Top Bar */}
      <Header
        roomId={roomId}
        usersCount={users.length || 1}
        users={users}
        onToggleChat={() => {
          setIsChatOpen(!isChatOpen);
          setUnreadChatCount(0);
        }}
        onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
        unreadChatCount={unreadChatCount}
        queueCount={queue.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 max-w-5xl w-full mx-auto px-4 py-6 sm:py-10 flex flex-col items-center justify-between">
        {/* Sync Status Badge */}
        <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full apple-glass-pill shadow-sm">
          <Wifi size={13} className={isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'} />
          <span className="text-xs font-medium text-white/80">
            {users.length > 1 ? `Synced with ${users.length - 1} friend` : 'Waiting for friend to join...'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
            {currentTrack.source?.toUpperCase()}
          </span>
        </div>

        {/* Player Component Switcher based on Source */}
        <div className="w-full max-w-xl mx-auto my-2">
          {currentTrack.source === 'youtube' && (
            <YouTubePlayer
              track={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              onPlay={(cur) => {
                if (!isPlaying) {
                  setIsPlaying(true);
                  socket?.emit('sync-play', { roomId, currentTime: cur });
                }
              }}
              onPause={(cur) => {
                if (isPlaying) {
                  setIsPlaying(false);
                  socket?.emit('sync-pause', { roomId, currentTime: cur });
                }
              }}
              onProgress={(cur, dur) => {
                setCurrentTime(cur);
                if (dur && dur > 0) setDuration(dur);
              }}
              volume={isMuted ? 0 : volume}
            />
          )}

          {currentTrack.source === 'mp3' && (
            <Mp3Player
              track={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              onPlay={(cur) => {
                if (!isPlaying) {
                  setIsPlaying(true);
                  socket?.emit('sync-play', { roomId, currentTime: cur });
                }
              }}
              onPause={(cur) => {
                if (isPlaying) {
                  setIsPlaying(false);
                  socket?.emit('sync-pause', { roomId, currentTime: cur });
                }
              }}
              onProgress={(cur, dur) => {
                setCurrentTime(cur);
                if (dur && dur > 0) setDuration(dur);
              }}
              onTrackChange={handleTrackChange}
              volume={isMuted ? 0 : volume}
            />
          )}

          {currentTrack.source === 'spotify' && (
            <SpotifyPlayer
              track={currentTrack}
              isPlaying={isPlaying}
            />
          )}
        </div>

        {/* Apple Now Playing Card & Controls */}
        <div className="w-full max-w-xl mx-auto mt-4 apple-glass-card rounded-3xl p-5 sm:p-7 shadow-2xl relative">
          {/* Track Info & Visualizer */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                {currentTrack.title}
              </h1>
              <p className="text-sm font-medium text-[#86868b] truncate mt-0.5">
                {currentTrack.artist || 'Unknown Artist'}
              </p>
            </div>

            {/* Visualizer */}
            <div className="shrink-0">
              <AudioVisualizer isPlaying={isPlaying} />
            </div>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="my-4">
            <div className="relative group cursor-pointer flex items-center">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime || 0}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#fa2d48] focus:outline-none"
              />
            </div>
            <div className="flex justify-between items-center text-[11px] font-medium text-white/40 mt-1.5 tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Primary Controls Dock */}
          <div className="flex items-center justify-between gap-3 mt-4">
            {/* Left: Add Track / Source Modal */}
            <button
              onClick={() => setIsAddOpen(true)}
              className="apple-glass-pill hover:bg-white/15 active:scale-95 text-xs font-semibold px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-white/90 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Plus size={15} />
              <span className="hidden xs:inline">Change / Add Song</span>
              <span className="xs:hidden">Song</span>
            </button>

            {/* Center: Playback Controls */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => handleSeek(0)}
                className="p-2 sm:p-2.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer active:scale-95"
                title="Restart Song"
              >
                <RotateCcw size={18} />
              </button>

              <button
                onClick={handleTogglePlay}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full apple-glow-button flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause size={24} className="fill-white" />
                ) : (
                  <Play size={24} className="fill-white ml-0.5" />
                )}
              </button>

              <button
                onClick={handlePlayNext}
                disabled={queue.length === 0}
                className="p-2 sm:p-2.5 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white/70 hover:text-white transition-all cursor-pointer active:scale-95"
                title="Next Song in Queue"
              >
                <SkipForward size={20} />
              </button>
            </div>

            {/* Right: Volume Control */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseInt(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-16 sm:w-20 h-1 bg-white/15 rounded-full appearance-none cursor-pointer accent-[#fa2d48] hidden sm:block"
              />
            </div>
          </div>

          {/* Quick Reaction Bar Under Player */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-around gap-1">
            {['❤️', '🔥', '💃', '🎧', '😭', '🫶'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSendReaction(emoji)}
                className="text-2xl hover:scale-130 active:scale-90 p-1.5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer select-none"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Helpful Tip Footer */}
        <div className="mt-8 text-center text-xs text-white/40 space-y-1">
          <p>
            Share room link with your friend — whenever anyone plays, pauses or seeks, both will hear it together in sync!
          </p>
        </div>
      </main>

      {/* Modals & Drawers */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        onSendMessage={handleSendChat}
        onSendReaction={handleSendReaction}
        currentUsername={username}
      />

      <QueueModal
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        queue={queue}
        currentTrack={currentTrack}
        onPlayNext={handlePlayNext}
        onRemoveFromQueue={handleRemoveFromQueue}
        onOpenAddModal={() => setIsAddOpen(true)}
      />

      <AddTrackModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onPlayTrack={handleTrackChange}
        onAddToQueue={handleAddToQueue}
      />
    </div>
  );
}

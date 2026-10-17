# 🎵 SyncBeats — Apple-Level Real-Time Synchronized Music Web App

Built for listening to music synchronously with long-distance friends, partners, or groups.

## ✨ Features

- 🍎 **Apple Website Level UI/UX**:
  - Deep obsidian theme with dynamic animated aurora background glow.
  - Frosted glassmorphism (`backdrop-blur-3xl`, subtle glass borders).
  - Apple SF Pro typographic hierarchy and fluid micro-interactions.
  - Live Audio Spectrum Visualizer dancing to the beat.
  - Rotating vinyl album art with glow effects for MP3s.
- ⚡ **Microsecond Precision Audio Sync**:
  - WebSockets (Socket.io) real-time state synchronization.
  - Time drift auto-calibration so both listeners hear music at the exact same second.
  - Synced Play, Pause, Seek, and Queue progression.
- 🎶 **All 3 Audio Sources Supported**:
  - **YouTube**: Paste any YouTube URL or Video ID; syncs via YouTube IFrame API.
  - **MP3 Upload / Local Audio**: Upload your own audio files directly from phone/laptop with automatic server streaming.
  - **Spotify**: Embedded Spotify player widget with quick app handoff & Spotify Jam links.
- 💬 **Live Chat & Floating Emoji Reactions**:
  - In-app glass chat drawer.
  - Floating emoji shower (❤️, 🔥, 💃, 🎧, 😭, 🫶) rendered synchronously on both screens when tapped!
- 🔗 **Instant Room Share**:
  - 1-click room invite link copying.
  - Direct WhatsApp invite button with pre-filled message.

## 🚀 How to Run

```bash
cd /data/user/0/com.termux/files/home/projects/sync-beats

# Start server + web app
pnpm start
```
Then open `http://localhost:4000` in your browser.

## 🌍 Connecting with Long-Distance Friend

Since your friend is in another location, you can expose your local server with a free HTTPS tunnel:
```bash
npx localtunnel --port 4000
```
Or deploy this folder directly to [Render](https://render.com) or [Railway](https://railway.app) for free 24/7 cloud hosting!

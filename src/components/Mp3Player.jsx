import React, { useEffect, useRef, useState } from 'react';
import { Upload, Music, Disc3, Sparkles } from 'lucide-react';

export default function Mp3Player({
  track,
  isPlaying,
  currentTime,
  onPlay,
  onPause,
  onSeek,
  onProgress,
  onTrackChange,
  volume = 80
}) {
  const audioRef = useRef(null);
  const isRemoteAction = useRef(false);
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Audio source URL
  const audioSrc = track?.url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  // Handle Play/Pause sync from props
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    isRemoteAction.current = true;
    if (isPlaying) {
      audio.play().catch(() => {
        // Autoplay may need user gesture on mobile
      });
    } else {
      audio.pause();
    }
    setTimeout(() => {
      isRemoteAction.current = false;
    }, 300);
  }, [isPlaying]);

  // Handle Seek/Time sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (Math.abs(audio.currentTime - currentTime) > 1.2) {
      isRemoteAction.current = true;
      audio.currentTime = currentTime;
      setTimeout(() => {
        isRemoteAction.current = false;
      }, 300);
    }
  }, [currentTime]);

  // Handle Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
    }
  }, [volume]);

  // Audio Element Event Listeners
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 0;
    if (dur && dur !== duration) setDuration(dur);
    if (onProgress) onProgress(cur, dur);
  };

  const handleAudioPlay = () => {
    if (isRemoteAction.current) return;
    onPlay && onPlay(audioRef.current?.currentTime || 0);
  };

  const handleAudioPause = () => {
    if (isRemoteAction.current) return;
    onPause && onPause(audioRef.current?.currentTime || 0);
  };

  // Upload MP3 File
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch('/api/upload-mp3', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.track) {
        onTrackChange && onTrackChange({
          ...data.track,
          cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
        });
      }
    } catch (err) {
      console.error('Failed to upload audio:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 rounded-3xl apple-glass-card">
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
            if (currentTime > 0) audioRef.current.currentTime = currentTime;
            if (isPlaying) audioRef.current.play().catch(() => {});
          }
        }}
      />

      {/* Vinyl Disc Aesthetic */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Glow ambient background */}
        <div
          className={`absolute -inset-4 rounded-full blur-2xl transition-opacity duration-1000 ${
            isPlaying ? 'opacity-70 bg-gradient-to-tr from-[#fa2d48]/40 to-indigo-500/30' : 'opacity-20 bg-white/5'
          }`}
        />

        {/* Rotating Vinyl Record */}
        <div
          className={`w-48 h-48 md:w-60 md:h-60 rounded-full bg-[#111115] border-4 border-[#22222a] shadow-2xl flex items-center justify-center relative overflow-hidden transition-all duration-700 ${
            isPlaying ? 'animate-disc-spin shadow-[0_0_50px_rgba(250,45,72,0.35)]' : ''
          }`}
        >
          {/* Vinyl Grooves */}
          <div className="absolute inset-2 rounded-full border border-white/5" />
          <div className="absolute inset-6 rounded-full border border-white/5" />
          <div className="absolute inset-10 rounded-full border border-white/5" />
          <div className="absolute inset-14 rounded-full border border-white/5" />

          {/* Album Center Sticker */}
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-[#fa2d48] to-[#ff5e62] flex items-center justify-center shadow-inner relative z-10">
            <div className="w-6 h-6 rounded-full bg-[#060608] border-2 border-white/40 flex items-center justify-center shadow-md">
              <div className="w-2 h-2 rounded-full bg-white/70" />
            </div>
          </div>
        </div>
      </div>

      {/* Upload button */}
      <div className="mt-4 flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.m4a"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="apple-glass-pill hover:bg-white/10 active:scale-95 text-white/90 text-xs font-medium px-4 py-2 rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Upload size={14} className={isUploading ? 'animate-bounce text-[#fa2d48]' : 'text-white/70'} />
          <span>{isUploading ? 'Uploading MP3...' : 'Upload Local MP3 / Song'}</span>
        </button>
      </div>
    </div>
  );
}

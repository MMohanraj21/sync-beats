import React, { useState } from 'react';
import { Music2, Sparkles, ArrowRight, Radio } from 'lucide-react';

const AVATARS = ['🎧', '💖', '🎸', '🦋', '🦁', '🌸', '⚡', '🐻', '🌙', '☕'];

export default function JoinModal({ roomId, onJoin }) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🎧');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Unga name type pannunga!');
      return;
    }
    localStorage.setItem('syncbeats_username', name.trim());
    localStorage.setItem('syncbeats_avatar', selectedAvatar);
    onJoin(name.trim(), selectedAvatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="w-full max-w-sm rounded-3xl apple-glass-card border border-white/15 p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col items-center text-center relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#fa2d48]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#fa2d48] to-[#ff5e62] flex items-center justify-center shadow-[0_0_30px_rgba(250,45,72,0.5)] mb-3 relative z-10">
          <Music2 size={28} className="text-white" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-white mb-1">
          SyncBeats Live
        </h1>
        <p className="text-xs text-white/50 mb-4">
          Join room <span className="text-[#fa2d48] font-semibold">#{roomId}</span> to listen together
        </p>

        {/* Avatar Selection */}
        <div className="w-full mb-4">
          <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-wider">
            Choose your avatar
          </label>
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setSelectedAvatar(av)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                  selectedAvatar === av
                    ? 'bg-[#fa2d48] scale-110 shadow-md ring-2 ring-white/40'
                    : 'bg-white/5 hover:bg-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Name Input */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your name (e.g. Mohanraj)"
              autoFocus
              className="w-full bg-white/10 border border-white/15 rounded-2xl px-4 py-3 text-sm text-center text-white placeholder-white/40 focus:outline-none focus:border-[#fa2d48]/70 focus:bg-white/15 transition-all shadow-inner"
            />
          </div>

          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full apple-glow-button disabled:opacity-40 text-sm font-semibold py-3.5 rounded-2xl text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg active:scale-98"
          >
            <span>Join & Start Listening</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-[10px] text-white/40 mt-4 flex items-center gap-1 justify-center">
          <Radio size={11} className="text-emerald-400" />
          <span>Real-time audio sync powered by WebSockets</span>
        </p>
      </div>
    </div>
  );
}

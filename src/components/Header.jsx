import React, { useState } from 'react';
import { Music2, Copy, Check, Share2, Users, MessageSquare, ListMusic } from 'lucide-react';

export default function Header({
  roomId,
  usersCount = 1,
  users = [],
  onToggleChat,
  onToggleQueue,
  unreadChatCount = 0,
  queueCount = 0
}) {
  const [copied, setCopied] = useState(false);

  const roomLink = typeof window !== 'undefined' ? `${window.location.origin}?room=${roomId}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `Hey! En kooda song keka vaa, ore time-la sync panni kekkalam 🎵🎧:\n${roomLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <header className="sticky top-0 z-40 w-full apple-glass border-b border-white/10 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#fa2d48] to-[#ff5e62] flex items-center justify-center shadow-[0_0_20px_rgba(250,45,72,0.4)]">
            <Music2 size={19} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                SyncBeats
              </span>
              <span className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-[#fa2d48]/20 text-[#fa2d48] border border-[#fa2d48]/30">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-white/50 -mt-0.5">Listen Together</p>
          </div>
        </div>

        {/* Center: Live Listeners Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full apple-glass-pill">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs text-white/80 font-medium">
            {usersCount} {usersCount === 1 ? 'person vibe' : 'listening together'}
          </span>
          {/* User avatars preview */}
          <div className="flex -space-x-1.5 ml-1">
            {users.slice(0, 3).map((u, i) => (
              <span
                key={i}
                title={u.username}
                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-[10px] border border-white/20 select-none"
              >
                {u.avatar || '👤'}
              </span>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Room Link Copy */}
          <button
            onClick={handleCopy}
            className="apple-glass-pill hover:bg-white/15 active:scale-95 text-xs text-white/90 font-medium px-2.5 sm:px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
            title="Copy Invite Link"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="text-white/70" />}
            <span className="hidden xs:inline">{copied ? 'Copied Link!' : `Room #${roomId}`}</span>
            <span className="xs:hidden">{copied ? 'Copied' : `#${roomId}`}</span>
          </button>

          {/* WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            className="apple-glass-pill hover:bg-emerald-500/20 text-emerald-400 p-2 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer active:scale-95"
            title="Share to Friend on WhatsApp"
          >
            <Share2 size={14} />
            <span className="hidden md:inline">Invite Friend</span>
          </button>

          {/* Queue Button */}
          <button
            onClick={onToggleQueue}
            className="relative apple-glass-pill hover:bg-white/15 p-2 rounded-full text-white/80 transition-all cursor-pointer active:scale-95"
            title="Music Queue"
          >
            <ListMusic size={16} />
            {queueCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#fa2d48] text-[9px] font-bold flex items-center justify-center text-white shadow-sm">
                {queueCount}
              </span>
            )}
          </button>

          {/* Chat Drawer Toggle */}
          <button
            onClick={onToggleChat}
            className="relative apple-glass-pill hover:bg-white/15 p-2 rounded-full text-white/80 transition-all cursor-pointer active:scale-95"
            title="Live Chat"
          >
            <MessageSquare size={16} />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0071e3] text-[9px] font-bold flex items-center justify-center text-white shadow-sm">
                {unreadChatCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

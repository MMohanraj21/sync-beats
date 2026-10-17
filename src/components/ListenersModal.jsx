import React from 'react';
import { X, Users, Crown, Share2, Copy, Check } from 'lucide-react';

export default function ListenersModal({
  isOpen,
  onClose,
  users = [],
  currentUserId,
  roomId
}) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const roomLink = typeof window !== 'undefined' ? `${window.location.origin}?room=${roomId}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = `Hey! En kooda song keka vaa, ore time-la sync panni kekkalam 🎵🎧:\n${roomLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl apple-glass-card border border-white/10 p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-emerald-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Listeners in Room ({users.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* User list */}
        <div className="py-3 space-y-2 max-h-60 overflow-y-auto">
          {users.map((u, i) => {
            const isMe = u.id === currentUserId;
            return (
              <div
                key={u.id || i}
                className="p-2.5 rounded-2xl apple-glass-pill flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{u.avatar || '🎧'}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white">
                        {u.username}
                      </span>
                      {isMe && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-white/70">
                          You
                        </span>
                      )}
                      {u.isHost && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 flex items-center gap-0.5">
                          <Crown size={9} /> Host
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Listening in sync
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Invite buttons */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 apple-glass-pill hover:bg-white/15 text-xs font-medium py-2 rounded-xl text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied Link' : 'Copy Link'}</span>
          </button>
          <button
            onClick={handleShare}
            className="apple-glow-button text-xs font-semibold px-4 py-2 rounded-xl text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Share2 size={13} />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { X, Play, Trash2, ListMusic, Plus } from 'lucide-react';

export default function QueueModal({
  isOpen,
  onClose,
  queue = [],
  currentTrack,
  onPlayNext,
  onRemoveFromQueue,
  onOpenAddModal
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl apple-glass-card border border-white/10 p-5 shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ListMusic size={20} className="text-[#fa2d48]" />
            <h2 className="text-base font-bold text-white tracking-wide">Up Next / Queue</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Playing Song Card */}
        {currentTrack && (
          <div className="my-3 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#fa2d48] to-[#ff5e62] flex items-center justify-center overflow-hidden shrink-0">
              {currentTrack.cover ? (
                <img src={currentTrack.cover} alt="" className="w-full h-full object-cover" />
              ) : (
                <Play size={18} className="text-white fill-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold tracking-wider text-[#fa2d48] uppercase">Now Playing</span>
              <p className="text-sm font-semibold text-white truncate">{currentTrack.title}</p>
              <p className="text-xs text-white/50 truncate">{currentTrack.artist || 'Unknown Artist'} • {currentTrack.source?.toUpperCase()}</p>
            </div>
          </div>
        )}

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
          {queue.length === 0 ? (
            <div className="text-center py-10 text-white/40 space-y-2">
              <p className="text-sm font-medium">The queue is currently empty</p>
              <p className="text-xs text-white/30">Add YouTube songs, MP3s or Spotify tracks so the vibe never stops!</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAddModal();
                }}
                className="mt-3 apple-glow-button text-xs font-semibold px-4 py-2 rounded-full text-white inline-flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Plus size={14} /> Add Song to Queue
              </button>
            </div>
          ) : (
            queue.map((track, idx) => (
              <div
                key={track.id || idx}
                className="p-3 rounded-2xl apple-glass-pill hover:bg-white/10 flex items-center justify-between gap-3 group transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-semibold text-white/40 w-4 text-center">{idx + 1}</span>
                  <div className="w-9 h-9 rounded-lg bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {track.cover ? (
                      <img src={track.cover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs">🎵</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                    <p className="text-[11px] text-white/40 truncate">
                      {track.artist || track.source} {track.addedBy ? `• Added by ${track.addedBy}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveFromQueue(idx)}
                  className="opacity-70 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-all cursor-pointer"
                  title="Remove from queue"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {queue.length > 0 && (
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                onClose();
                onOpenAddModal();
              }}
              className="apple-glass-pill hover:bg-white/10 text-white/80 text-xs font-medium px-4 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={14} /> Add More
            </button>
            <button
              onClick={() => {
                onPlayNext();
                onClose();
              }}
              className="apple-glow-button text-xs font-semibold px-5 py-2 rounded-full text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Play size={14} className="fill-white" /> Play Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Heart, Flame, Sparkles, Smile } from 'lucide-react';

const QUICK_EMOJIS = ['❤️', '🔥', '💃', '🎧', '😭', '🫶', '✨', '🥺'];

export default function ChatDrawer({
  isOpen,
  onClose,
  messages = [],
  onSendMessage,
  onSendReaction,
  currentUsername
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 flex flex-col apple-glass border-l border-white/10 shadow-2xl backdrop-blur-3xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Live Vibe Chat</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Quick Reactions Bar */}
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between gap-1 overflow-x-auto bg-black/20">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSendReaction(emoji)}
            className="text-xl p-1.5 rounded-xl hover:scale-125 active:scale-95 hover:bg-white/10 transition-all cursor-pointer select-none"
            title={`React ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-white/40 p-4 space-y-2">
            <Smile size={32} className="opacity-40" />
            <p className="text-xs">No messages yet. Send a message or react to vibe together!</p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="text-[11px] text-white/40 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isMe = msg.sender === currentUsername;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-[10px] text-white/50">{msg.avatar} {msg.sender}</span>
                  <span className="text-[9px] text-white/30">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-gradient-to-r from-[#fa2d48] to-[#ff5e62] text-white rounded-br-sm shadow-md'
                      : 'apple-glass-pill text-white/90 rounded-bl-sm border border-white/10'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-black/30">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message to your friend..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#fa2d48]/50 focus:bg-white/10 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-9 h-9 rounded-full bg-[#fa2d48] hover:bg-[#ff5e62] disabled:opacity-40 disabled:hover:bg-[#fa2d48] text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
          >
            <Send size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}

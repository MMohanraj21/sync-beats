import React from 'react';

export default function FloatingReactions({ reactions }) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {reactions.map((item) => (
        <div
          key={item.id}
          className="absolute bottom-28 animate-float-up flex flex-col items-center select-none"
          style={{
            left: `${item.x || 50}%`,
          }}
        >
          <div className="text-4xl filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transform hover:scale-125 transition-transform">
            {item.emoji}
          </div>
          {item.sender && (
            <span className="mt-1 px-2 py-0.5 text-[10px] font-medium tracking-wide bg-black/60 backdrop-blur-md rounded-full text-white/90 border border-white/10 shadow-sm">
              {item.sender}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

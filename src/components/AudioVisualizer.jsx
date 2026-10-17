import React, { useEffect, useRef } from 'react';

export default function AudioVisualizer({ isPlaying, accentColor = '#fa2d48' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const numBars = 36;
    const barWidth = 3;
    const gap = 4;
    const heights = new Array(numBars).fill(4);
    const targetHeights = new Array(numBars).fill(4);

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      phase += 0.08;

      for (let i = 0; i < numBars; i++) {
        if (isPlaying) {
          // Dynamic rhythm generation with smooth sinusoidal waves + harmonic noise
          const wave1 = Math.sin(phase + i * 0.28);
          const wave2 = Math.cos(phase * 0.7 + i * 0.15);
          const baseHeight = Math.abs(wave1 * wave2) * 32 + 6;
          targetHeights[i] = Math.min(44, Math.max(4, baseHeight));
        } else {
          targetHeights[i] = 4;
        }

        // Smooth lerp interpolation
        heights[i] += (targetHeights[i] - heights[i]) * 0.2;

        const x = i * (barWidth + gap);
        const y = canvas.height - heights[i];

        // Apple-style vertical gradient
        const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
        gradient.addColorStop(0, accentColor);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');

        ctx.fillStyle = gradient;
        // Rounded bar caps
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, heights[i], [2, 2, 0, 0]);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, accentColor]);

  return (
    <div className="flex items-center justify-center py-1">
      <canvas
        ref={canvasRef}
        width={36 * 7}
        height={48}
        className="opacity-90 filter drop-shadow-[0_0_8px_rgba(250,45,72,0.4)]"
      />
    </div>
  );
}

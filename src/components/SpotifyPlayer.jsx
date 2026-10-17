import React from 'react';
import { ExternalLink, Radio } from 'lucide-react';

export default function SpotifyPlayer({ track, isPlaying }) {
  // Extract Spotify track ID from URL or trackId
  const getSpotifyId = (url) => {
    if (!url) return '4cOdK2wGLETKBW3PvgPWqT'; // Default demo track
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : (track?.trackId || '4cOdK2wGLETKBW3PvgPWqT');
  };

  const spotifyId = getSpotifyId(track?.url);
  const spotifyEmbedUrl = `https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`;

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 rounded-3xl apple-glass-card">
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#121212]">
        <iframe
          src={spotifyEmbedUrl}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-2xl"
          title="Spotify Web Player"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <a
          href={track?.url || `https://open.spotify.com/track/${spotifyId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="apple-glass-pill hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium px-4 py-2 rounded-full flex items-center gap-2 transition-all cursor-pointer"
        >
          <ExternalLink size={13} />
          <span>Open in Spotify App</span>
        </a>

        <a
          href="https://support.spotify.com/article/group-session/"
          target="_blank"
          rel="noopener noreferrer"
          className="apple-glass-pill hover:bg-white/10 text-white/70 text-xs font-medium px-3 py-2 rounded-full flex items-center gap-1.5 transition-all"
        >
          <Radio size={13} className="text-emerald-400" />
          <span>Spotify Jam Guide</span>
        </a>
      </div>
    </div>
  );
}

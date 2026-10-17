import React, { useState } from 'react';
import { X, Youtube, Music, Radio, Plus, Play, Sparkles } from 'lucide-react';

const PRESET_VIBES = [
  {
    title: 'Nenjame Nenjame (Doctor)',
    artist: 'Anirudh Ravichander',
    source: 'youtube',
    url: 'https://www.youtube.com/watch?v=3V94H62zWoc',
    trackId: '3V94H62zWoc',
    cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'
  },
  {
    title: 'Starboy (Official)',
    artist: 'The Weeknd ft. Daft Punk',
    source: 'youtube',
    url: 'https://www.youtube.com/watch?v=34Na4j8AVgA',
    trackId: '34Na4j8AVgA',
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80'
  },
  {
    title: 'Kanave Kanave (David)',
    artist: 'Anirudh Ravichander',
    source: 'youtube',
    url: 'https://www.youtube.com/watch?v=1F3hm6MfR1k',
    trackId: '1F3hm6MfR1k',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
  },
  {
    title: 'Chill Lofi Beats to Relax',
    artist: 'Lofi Girl',
    source: 'youtube',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    trackId: 'jfKfPfyJRdk',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
  }
];

export default function AddTrackModal({
  isOpen,
  onClose,
  onPlayTrack,
  onAddToQueue
}) {
  const [activeTab, setActiveTab] = useState('youtube'); // 'youtube' | 'mp3' | 'spotify'
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset, mode = 'play') => {
    if (mode === 'queue') {
      onAddToQueue(preset);
    } else {
      onPlayTrack(preset);
    }
    onClose();
  };

  const handleCustomSubmit = (e, mode = 'play') => {
    e.preventDefault();
    if (!url.trim()) return;

    let track = {
      id: `${activeTab}-${Date.now()}`,
      source: activeTab,
      title: title.trim() || 'Custom Track',
      artist: artist.trim() || (activeTab === 'youtube' ? 'YouTube Audio' : 'Audio Track'),
      url: url.trim(),
      cover: activeTab === 'youtube'
        ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80'
    };

    if (mode === 'queue') {
      onAddToQueue(track);
    } else {
      onPlayTrack(track);
    }

    setUrl('');
    setTitle('');
    setArtist('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl apple-glass-card border border-white/10 p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Add Song to Session</h2>
            <p className="text-xs text-white/50">Choose YouTube, MP3 or Spotify</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Source Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 my-4 bg-white/5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('youtube')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'youtube' ? 'bg-[#fa2d48] text-white shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <Youtube size={15} />
            <span>YouTube</span>
          </button>
          <button
            onClick={() => setActiveTab('mp3')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'mp3' ? 'bg-[#fa2d48] text-white shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <Music size={15} />
            <span>MP3 Audio</span>
          </button>
          <button
            onClick={() => setActiveTab('spotify')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'spotify' ? 'bg-emerald-600 text-white shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <Radio size={15} />
            <span>Spotify</span>
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <form className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                {activeTab === 'youtube' && 'YouTube URL / Link'}
                {activeTab === 'mp3' && 'Direct MP3 Stream URL'}
                {activeTab === 'spotify' && 'Spotify Track URL / ID'}
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={
                  activeTab === 'youtube'
                    ? 'https://www.youtube.com/watch?v=...'
                    : activeTab === 'mp3'
                    ? 'https://example.com/song.mp3'
                    : 'https://open.spotify.com/track/...'
                }
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#fa2d48]/50 focus:bg-white/10 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                  Song Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. En Kadhal Solla"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#fa2d48]/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                  Artist (Optional)
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="e.g. Yuvan Shankar Raja"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#fa2d48]/50 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={(e) => handleCustomSubmit(e, 'play')}
                disabled={!url.trim()}
                className="flex-1 apple-glow-button disabled:opacity-40 text-xs sm:text-sm font-semibold py-3 rounded-2xl text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-98"
              >
                <Play size={15} className="fill-white" /> Play Now
              </button>
              <button
                type="button"
                onClick={(e) => handleCustomSubmit(e, 'queue')}
                disabled={!url.trim()}
                className="apple-glass-pill hover:bg-white/15 disabled:opacity-40 text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl text-white flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Plus size={15} /> Add to Queue
              </button>
            </div>
          </form>

          {/* Quick Presets / Trending Hits */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 mb-2">
              <Sparkles size={14} className="text-[#fa2d48]" />
              <span>Instant Hits & Presets</span>
            </div>
            <div className="space-y-2">
              {PRESET_VIBES.map((preset, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-2xl apple-glass-pill hover:bg-white/10 flex items-center justify-between gap-3 group transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={preset.cover} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{preset.title}</p>
                      <p className="text-[10px] text-white/50 truncate">{preset.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSelectPreset(preset, 'play')}
                      className="p-2 rounded-xl bg-white/10 hover:bg-[#fa2d48] text-white transition-all cursor-pointer active:scale-95"
                      title="Play Now"
                    >
                      <Play size={12} className="fill-white" />
                    </button>
                    <button
                      onClick={() => handleSelectPreset(preset, 'queue')}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer active:scale-95"
                      title="Add to Queue"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

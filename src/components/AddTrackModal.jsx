import React, { useState, useEffect } from 'react';
import { X, Search, Play, Plus, Sparkles, Music, Loader2, Link2, Upload } from 'lucide-react';

const SUGGESTIONS = [
  'Anirudh hits',
  'Yuvan melodies',
  'AR Rahman romantic',
  'Harris Jayaraj',
  'Kanave Kanave',
  'Chill lofi beats',
  'Tamil 90s hits',
  'Starboy The Weeknd'
];

export default function AddTrackModal({
  isOpen,
  onClose,
  onPlayTrack,
  onAddToQueue
}) {
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'link' | 'mp3'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Direct link inputs
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customArtist, setCustomArtist] = useState('');

  // Initial popular search on mount or tab select
  useEffect(() => {
    if (isOpen && searchResults.length === 0 && !hasSearched) {
      handleSearch('Anirudh love songs');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (queryToSearch) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;

    setIsLoading(true);
    setHasSearched(true);
    if (queryToSearch) setSearchQuery(queryToSearch);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error('Failed to search songs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = (track) => {
    onPlayTrack(track);
    onClose();
  };

  const handleQueue = (track) => {
    onAddToQueue(track);
    onClose();
  };

  const handleCustomSubmit = (mode = 'play') => {
    if (!customUrl.trim()) return;

    const track = {
      id: `custom-${Date.now()}`,
      source: customUrl.includes('spotify.com') ? 'spotify' : 'youtube',
      title: customTitle.trim() || 'Custom Song',
      artist: customArtist.trim() || 'Online Audio',
      url: customUrl.trim(),
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      duration: 210
    };

    if (mode === 'queue') {
      onAddToQueue(track);
    } else {
      onPlayTrack(track);
    }
    setCustomUrl('');
    setCustomTitle('');
    setCustomArtist('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl apple-glass-card border border-white/10 p-5 sm:p-6 shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Search & Play Any Song</span>
              <Sparkles size={16} className="text-[#fa2d48]" />
            </h2>
            <p className="text-xs text-white/50">Zero ads • Audio-only • Synced with your friend</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 my-3 bg-white/5 rounded-2xl border border-white/5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'search' ? 'bg-[#fa2d48] text-white shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <Search size={14} />
            <span>Search YouTube</span>
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'link' ? 'bg-[#fa2d48] text-white shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <Link2 size={14} />
            <span>Paste Link</span>
          </button>
        </div>

        {activeTab === 'search' && (
          <div className="flex flex-col flex-1 min-h-0 space-y-3">
            {/* Search Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="relative"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search song, movie or artist name..."
                className="w-full bg-white/10 border border-white/15 rounded-2xl pl-11 pr-24 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#fa2d48]/70 focus:bg-white/15 transition-all shadow-inner"
              />
              <Search size={18} className="absolute left-4 top-3.5 text-white/40" />
              <button
                type="submit"
                disabled={isLoading || !searchQuery.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-xl bg-[#fa2d48] hover:bg-[#ff5e62] disabled:opacity-40 text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
              >
                {isLoading ? <Loader2 size={13} className="animate-spin" /> : 'Search'}
              </button>
            </form>

            {/* Quick Suggestion Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSearch(tag)}
                  className="apple-glass-pill hover:bg-white/15 text-[11px] text-white/70 hover:text-white whitespace-nowrap px-3 py-1 rounded-full transition-all cursor-pointer active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Search Results List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isLoading ? (
                <div className="py-14 flex flex-col items-center justify-center text-white/50 space-y-2">
                  <Loader2 size={26} className="animate-spin text-[#fa2d48]" />
                  <p className="text-xs font-medium">Finding songs for you & your friend...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center text-white/40 space-y-1">
                  <p className="text-sm font-medium">No songs found</p>
                  <p className="text-xs text-white/30">Type a song name or movie title above</p>
                </div>
              ) : (
                searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-2xl apple-glass-pill hover:bg-white/10 flex items-center justify-between gap-3 group transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-white/10 overflow-hidden shrink-0 relative shadow-sm">
                        <img
                          src={item.cover}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {item.durationFormatted && (
                          <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/75 text-[9px] font-medium text-white/90">
                            {item.durationFormatted}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                        <p className="text-[11px] text-white/50 truncate mt-0.5">{item.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handlePlay(item)}
                        className="apple-glow-button text-xs font-semibold px-3 py-1.5 rounded-xl text-white flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                        title="Play Now for both"
                      >
                        <Play size={12} className="fill-white" />
                        <span>Play</span>
                      </button>
                      <button
                        onClick={() => handleQueue(item)}
                        className="apple-glass-pill hover:bg-white/15 p-2 rounded-xl text-white/70 hover:text-white transition-all cursor-pointer active:scale-95"
                        title="Add to queue"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'link' && (
          <div className="flex-1 overflow-y-auto space-y-3 py-2">
            <div>
              <label className="block text-[11px] font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                Direct YouTube / Spotify Link
              </label>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or Spotify link"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#fa2d48]/50 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                  Song Title (Optional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Song name"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#fa2d48]/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                  Artist (Optional)
                </label>
                <input
                  type="text"
                  value={customArtist}
                  onChange={(e) => setCustomArtist(e.target.value)}
                  placeholder="Artist name"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#fa2d48]/50 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleCustomSubmit('play')}
                disabled={!customUrl.trim()}
                className="flex-1 apple-glow-button disabled:opacity-40 text-xs sm:text-sm font-semibold py-3 rounded-2xl text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-98"
              >
                <Play size={15} className="fill-white" /> Play Now
              </button>
              <button
                type="button"
                onClick={() => handleCustomSubmit('queue')}
                disabled={!customUrl.trim()}
                className="apple-glass-pill hover:bg-white/15 disabled:opacity-40 text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl text-white flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Plus size={15} /> Add to Queue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

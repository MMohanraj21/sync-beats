import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function YouTubePlayer({
  track,
  isPlaying,
  currentTime,
  onPlay,
  onPause,
  onSeek,
  onProgress,
  volume = 80,
  onVolumeChange
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const isApiReady = useRef(false);
  const isRemoteAction = useRef(false);
  const progressInterval = useRef(null);
  const [duration, setDuration] = useState(240);

  // Extract clean YouTube video ID
  const getVideoId = (url) => {
    if (!url) return '34Na4j8AVgA';
    if (url.length === 11 && !url.includes('/') && !url.includes('?')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '34Na4j8AVgA';
  };

  const videoId = track?.trackId || getVideoId(track?.url);

  // Initialize YouTube Iframe
  useEffect(() => {
    let mounted = true;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) {
        setTimeout(initPlayer, 200);
        return;
      }

      if (!containerRef.current) return;

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0, // We render our own Apple-style sleek controls
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3
        },
        events: {
          onReady: (event) => {
            if (!mounted) return;
            isApiReady.current = true;
            event.target.setVolume(volume);

            const dur = event.target.getDuration();
            if (dur && dur > 0) setDuration(dur);

            if (typeof currentTime === 'number' && currentTime > 0) {
              event.target.seekTo(currentTime, true);
            }

            if (isPlaying) {
              event.target.playVideo();
            }
          },
          onStateChange: (event) => {
            if (!mounted) return;
            // 1: PLAYING, 2: PAUSED, 0: ENDED
            if (isRemoteAction.current) {
              return;
            }

            if (event.data === window.YT.PlayerState.PLAYING) {
              const cur = event.target.getCurrentTime();
              onPlay && onPlay(cur);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              const cur = event.target.getCurrentTime();
              onPause && onPause(cur);
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }

    return () => {
      mounted = false;
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [videoId]);

  // Sync isPlaying state from socket
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isApiReady.current || typeof player.playVideo !== 'function') return;

    isRemoteAction.current = true;
    try {
      const state = player.getPlayerState();
      if (isPlaying && state !== window.YT?.PlayerState?.PLAYING) {
        player.playVideo();
      } else if (!isPlaying && state === window.YT?.PlayerState?.PLAYING) {
        player.pauseVideo();
      }
    } catch (e) {}

    setTimeout(() => {
      isRemoteAction.current = false;
    }, 400);
  }, [isPlaying]);

  // Sync seek/currentTime from socket
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isApiReady.current || typeof player.getCurrentTime !== 'function') return;

    try {
      const current = player.getCurrentTime();
      if (Math.abs(current - currentTime) > 1.8) {
        isRemoteAction.current = true;
        player.seekTo(currentTime, true);
        setTimeout(() => {
          isRemoteAction.current = false;
        }, 400);
      }
    } catch (e) {}
  }, [currentTime]);

  // Sync Volume
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(volume);
      } catch (e) {}
    }
  }, [volume]);

  // Interval to track local time and duration
  useEffect(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);

    progressInterval.current = setInterval(() => {
      if (playerRef.current && isApiReady.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const cur = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          if (dur && dur > 0 && dur !== duration) setDuration(dur);
          if (onProgress) onProgress(cur, dur || duration);
        } catch (e) {}
      }
    }, 500);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [duration, onProgress]);

  return (
    <div className="absolute -left-[9999px] top-0 w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div ref={containerRef} />
    </div>
  );
}

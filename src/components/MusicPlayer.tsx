import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, Radio, Sparkles, ExternalLink } from 'lucide-react';

interface MusicPlayerProps {
  isTrainPassing?: boolean;
}

// Iconic 2000s Bollywood Nostalgia Playlist Tracks
const TRACK_PLAYLIST = [
  {
    title: 'Yuhi Chala Chal Rahi',
    movie: 'Swades (2004)',
    artist: 'Udit Narayan, Hariharan, Kailash Kher',
    time: '4:45',
  },
  {
    title: 'Dil Chahta Hai',
    movie: 'Dil Chahta Hai (2001)',
    artist: 'Shankar Mahadevan, Clinton Cerejo',
    time: '5:11',
  },
  {
    title: 'Mitwa',
    movie: 'Kabhi Alvida Naa Kehna (2006)',
    artist: 'Shafqat Amanat Ali, Shankar Mahadevan',
    time: '6:22',
  },
  {
    title: 'Yun Shabnami',
    movie: 'Saawariya (2007)',
    artist: 'Parthiv Gohil, Monty Sharma',
    time: '5:14',
  },
  {
    title: 'Guzarish',
    movie: 'Ghajini (2008)',
    artist: 'Javed Ali, Sonu Nigam',
    time: '5:29',
  },
];

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          height?: string | number;
          width?: string | number;
          videoId?: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState?: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
  }
}

interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  setVolume: (vol: number) => void;
  getVolume: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ isTrainPassing }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isYtReady, setIsYtReady] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const playerRef = useRef<YTPlayerInstance | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  // Initialize YouTube IFrame API
  useEffect(() => {
    // Check if script already exists
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        try {
          playerRef.current = new window.YT.Player('youtube-hidden-player', {
            height: '0',
            width: '0',
            videoId: 'W9RtTtOv80o',
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              enablejsapi: 1,
              fs: 0,
              listType: 'playlist',
              list: 'RDW9RtTtOv80o',
              origin: window.location.origin,
              rel: 0,
            },
            events: {
              onReady: (event) => {
                setIsYtReady(true);
                event.target.setVolume(volume);
              },
              onStateChange: (event) => {
                if (event.data === 1) {
                  // PLAYING
                  setIsPlaying(true);
                } else if (event.data === 2) {
                  // PAUSED
                  setIsPlaying(false);
                }
              },
            },
          });
        } catch {
          // Fallback gracefully
        }
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current?.destroy) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Update progress bar
  useEffect(() => {
    if (isPlaying) {
      progressTimerRef.current = window.setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const current = playerRef.current.getCurrentTime();
          const total = playerRef.current.getDuration() || 240;
          setProgress((current / total) * 100);
        } else {
          setProgress((p) => (p >= 100 ? 0 : p + 0.5));
        }
      }, 1000);
    } else {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    }

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (playerRef.current && isYtReady) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    if (playerRef.current && isYtReady) {
      playerRef.current.nextVideo();
    }
    setTrackIndex((prev) => (prev + 1) % TRACK_PLAYLIST.length);
    setProgress(0);
  };

  const handlePrev = () => {
    if (playerRef.current && isYtReady) {
      playerRef.current.previousVideo();
    }
    setTrackIndex((prev) => (prev - 1 + TRACK_PLAYLIST.length) % TRACK_PLAYLIST.length);
    setProgress(0);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol === 0) setIsMuted(true);
    else setIsMuted(false);

    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(newVol);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      handleVolumeChange(volume || 60);
    } else {
      setIsMuted(true);
      if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
        playerRef.current.setVolume(0);
      }
    }
  };

  const currentTrack = TRACK_PLAYLIST[trackIndex];

  return (
    <div className="fixed bottom-4 right-4 sm:right-8 z-40 max-w-sm sm:max-w-md w-full select-none">
      {/* Hidden YouTube iframe container */}
      <div id="youtube-hidden-player" className="hidden" />

      {/* Glassmorphism Atmospheric / Immersive Media Music Player */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl transition-all duration-300 text-white font-sans overflow-hidden">
        {/* Top bar with radio title & minimize */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2 text-yellow-400">
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
            <span className="font-bold tracking-widest uppercase text-[10px]">
              2000s NOSTALGIA RADIO
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="https://www.youtube.com/watch?v=W9RtTtOv80o&list=RDW9RtTtOv80o&start_radio=1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] text-gray-400 hover:text-yellow-400 flex items-center gap-1 transition-colors"
              title="Open original YouTube Radio Playlist"
            >
              <span>YouTube</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-400 hover:text-white text-xs px-1"
            >
              {isCollapsed ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-4">
            {/* Ticket Stamp Badge */}
            <div className="w-14 h-14 bg-[#7c2d12] rounded-xl flex items-center justify-center text-yellow-400 font-bold border border-yellow-400/30 shrink-0 shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              <div className="flex flex-col items-center">
                <Music className={`w-4 h-4 text-yellow-300 mb-0.5 ${isPlaying ? 'animate-bounce' : ''}`} />
                <span className="text-[7px] uppercase font-mono tracking-widest text-yellow-400 font-black">
                  TICKET
                </span>
              </div>
            </div>

            {/* Track Info & Scrubber */}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-yellow-400 uppercase tracking-widest font-bold">
                {isPlaying ? 'Now Playing' : 'Paused'}
              </div>
              <div className="text-sm font-semibold truncate text-white">
                {currentTrack.title}
              </div>
              <div className="text-[11px] text-gray-400 truncate">
                {currentTrack.movie} • {currentTrack.artist}
              </div>

              {/* Progress Scrubber */}
              <div className="mt-2 h-1 bg-white/20 rounded-full w-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Time & Playback Controls */}
              <div className="mt-2 flex justify-between items-center text-[10px] text-white/50 font-mono">
                <span>1:12</span>

                <div className="flex items-center gap-3">
                  <button
                    id="music-prev-btn"
                    onClick={handlePrev}
                    className="cursor-pointer hover:text-white transition-colors"
                    title="Previous Track"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id="music-play-toggle-btn"
                    onClick={togglePlay}
                    className="cursor-pointer text-yellow-400 hover:text-yellow-300 transition-transform active:scale-95"
                    title={isPlaying ? 'Pause Music' : 'Play 2000s Nostalgia Music'}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    id="music-next-btn"
                    onClick={handleNext}
                    className="cursor-pointer hover:text-white transition-colors"
                    title="Next Track"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span>{currentTrack.time}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

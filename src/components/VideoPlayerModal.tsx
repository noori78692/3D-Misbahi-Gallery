import React, { useState, useEffect, useRef } from 'react';
import { MediaItem } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import { MediaStoreService } from '../services/mediaStoreService';

const getSavedMediaPosition = (id: string): number => {
  try {
    const saved = localStorage.getItem(`media_pos_${id}`);
    return saved ? parseFloat(saved) : 0;
  } catch {
    return 0;
  }
};

const saveMediaPosition = (id: string, pos: number) => {
  try {
    localStorage.setItem(`media_pos_${id}`, pos.toString());
  } catch {}
};
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCw,
  Sun,
  ListVideo,
  ChevronLeft,
  ChevronRight,
  Layers,
  Cpu,
  Subtitles,
  Sparkles,
  Info,
  Clock,
  FastForward,
  Rewind,
  PictureInPicture2,
  Sliders,
} from 'lucide-react';

interface VideoPlayerModalProps {
  item: MediaItem;
  playlist: MediaItem[];
  onClose: () => void;
  onNavigate: (newItem: MediaItem) => void;
  soundEffectsEnabled: boolean;
  hardwareAcceleration: boolean;
  autoResumeMedia: boolean;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  item,
  playlist,
  onClose,
  onNavigate,
  soundEffectsEnabled,
  hardwareAcceleration,
  autoResumeMedia,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(item.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [brightness, setBrightness] = useState(100); // 0% to 150%
  const [aspectRatio, setAspectRatio] = useState<'fit' | 'fill' | '16:9' | '4:3'>('fit');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resumePrompt, setResumePrompt] = useState<number | null>(null);

  // Gesture Touch / Drag State
  const [gestureFeedback, setGestureFeedback] = useState<{ type: 'volume' | 'brightness' | 'seek'; value: string } | null>(null);
  const isDraggingRef = useRef<{ zone: 'left' | 'right' | 'horizontal' | null; startY: number; startX: number; initialVal: number }>({
    zone: null,
    startY: 0,
    startX: 0,
    initialVal: 0,
  });

  const [fetchedVideos, setFetchedVideos] = useState<MediaItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (playlist.length === 0) {
      MediaStoreService.getVideos().then((vids) => {
        if (isMounted) setFetchedVideos(vids);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [playlist]);

  const effectivePlaylist = playlist.length > 0 ? playlist : fetchedVideos;
  const videoPlaylist = effectivePlaylist.filter((i) => i.type === 'video');
  const currentIndex = videoPlaylist.findIndex((i) => i.id === item.id);
  const prevVideo = currentIndex > 0 ? videoPlaylist[currentIndex - 1] : videoPlaylist[videoPlaylist.length - 1];
  const nextVideo = currentIndex < videoPlaylist.length - 1 ? videoPlaylist[currentIndex + 1] : videoPlaylist[0];

  // Auto resume saved position check
  useEffect(() => {
    const savedPos = getSavedMediaPosition(item.id);
    if (savedPos > 5 && autoResumeMedia) {
      setResumePrompt(savedPos);
    }
  }, [item.id, autoResumeMedia]);

  // Sync volume & speed to video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [volume, isMuted, playbackSpeed]);

  // Save current time position
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);
      setDuration(videoRef.current.duration || item.duration || 0);
      if (Math.floor(cur) % 3 === 0) {
        saveMediaPosition(item.id, cur);
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
      playSoundEffect('click', soundEffectsEnabled);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current && videoRef.current.requestPictureInPicture) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.error('PiP Error:', e);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const handleApplyResume = (pos: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = pos;
      setCurrentTime(pos);
    }
    setResumePrompt(null);
  };

  // Touch Gesture Handling for Left (Brightness), Right (Volume), Horizontal (Seek)
  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relX = (e.clientX - rect.left) / rect.width;
    if (relX < 0.4) {
      isDraggingRef.current = { zone: 'left', startY: e.clientY, startX: e.clientX, initialVal: brightness };
    } else if (relX > 0.6) {
      isDraggingRef.current = { zone: 'right', startY: e.clientY, startX: e.clientX, initialVal: volume };
    } else {
      isDraggingRef.current = { zone: 'horizontal', startY: e.clientY, startX: e.clientX, initialVal: currentTime };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current.zone) return;

    const deltaY = isDraggingRef.current.startY - e.clientY; // drag up increases
    const deltaX = e.clientX - isDraggingRef.current.startX;

    if (isDraggingRef.current.zone === 'left') {
      const newB = Math.min(Math.max(isDraggingRef.current.initialVal + deltaY * 0.5, 20), 150);
      setBrightness(newB);
      setGestureFeedback({ type: 'brightness', value: `${Math.round(newB)}%` });
    } else if (isDraggingRef.current.zone === 'right') {
      const newV = Math.min(Math.max(isDraggingRef.current.initialVal + deltaY * 0.005, 0), 1);
      setVolume(newV);
      setIsMuted(newV === 0);
      setGestureFeedback({ type: 'volume', value: `${Math.round(newV * 100)}%` });
    } else if (isDraggingRef.current.zone === 'horizontal' && duration > 0) {
      const seekDelta = (deltaX / (containerRef.current?.clientWidth || 1000)) * duration;
      const targetTime = Math.min(Math.max(isDraggingRef.current.initialVal + seekDelta, 0), duration);
      if (videoRef.current) videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
      setGestureFeedback({
        type: 'seek',
        value: `${Math.floor(targetTime / 60)}:${Math.floor(targetTime % 60).toString().padStart(2, '0')}`,
      });
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current.zone = null;
    setTimeout(() => setGestureFeedback(null), 800);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatExtension = (title: string) => {
    const parts = title.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'MP4';
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-2xl animate-in fade-in duration-200 select-none overflow-hidden"
    >
      {/* Top Floating Action Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              saveMediaPosition(item.id, currentTime);
              onClose();
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">{item.title}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                {formatExtension(item.title)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Offline Built-in Video Player • {(item.sizeBytes / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center gap-2">
          {hardwareAcceleration && (
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Cpu className="w-3.5 h-3.5" />
              HW GPU Accelerated
            </span>
          )}

          {/* Subtitles Toggle */}
          <button
            onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
            className={`p-2.5 rounded-xl border transition-all ${
              subtitlesEnabled
                ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Subtitles"
          >
            <Subtitles className="w-4 h-4" />
          </button>

          {/* PiP Button */}
          <button
            onClick={togglePiP}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            title="Picture in Picture (PiP)"
          >
            <PictureInPicture2 className="w-4 h-4" />
          </button>

          {/* Playlist Button */}
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className={`p-2.5 rounded-xl border transition-all ${
              showPlaylist
                ? 'bg-purple-600 text-white border-purple-400'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
            title="Video Playlist Queue"
          >
            <ListVideo className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Video View Canvas */}
      <div className="relative w-full h-full flex items-center justify-center p-2">
        <video
          ref={videoRef}
          src={item.url}
          autoPlay
          style={{
            filter: `brightness(${brightness}%)`,
            objectFit: aspectRatio === 'fill' ? 'cover' : 'contain',
          }}
          className={`w-full max-h-[85vh] rounded-2xl shadow-2xl transition-all ${
            aspectRatio === '16:9' ? 'aspect-video' : aspectRatio === '4:3' ? 'aspect-4/3' : ''
          }`}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => nextVideo && onNavigate(nextVideo)}
        />

        {/* Subtitle Overlay Simulation */}
        {subtitlesEnabled && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl bg-black/80 border border-white/20 text-white text-xs sm:text-sm font-semibold text-center pointer-events-none drop-shadow-lg animate-in fade-in">
            💬 [Subtitle] {item.title} — Enjoy high-definition offline playback
          </div>
        )}

        {/* Gesture Visual Feedback HUD */}
        {gestureFeedback && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-4 rounded-3xl bg-slate-950/90 border border-purple-500/40 text-white text-lg font-bold flex items-center gap-3 backdrop-blur-2xl shadow-2xl animate-in zoom-in-95">
            {gestureFeedback.type === 'brightness' && <Sun className="w-6 h-6 text-amber-400" />}
            {gestureFeedback.type === 'volume' && <Volume2 className="w-6 h-6 text-cyan-400" />}
            {gestureFeedback.type === 'seek' && <Clock className="w-6 h-6 text-purple-400" />}
            <span>{gestureFeedback.value}</span>
          </div>
        )}

        {/* Resume Prompt Card */}
        {resumePrompt && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 p-4 rounded-2xl bg-purple-950/90 border border-purple-500/50 backdrop-blur-2xl shadow-2xl text-white flex items-center gap-4 animate-in slide-in-from-top-4">
            <Clock className="w-6 h-6 text-purple-300" />
            <div>
              <p className="text-xs font-bold">Resume Playback?</p>
              <span className="text-[11px] text-slate-300">Continue watching from {formatTime(resumePrompt)}?</span>
            </div>
            <button
              onClick={() => handleApplyResume(resumePrompt)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md"
            >
              Resume
            </button>
            <button
              onClick={() => setResumePrompt(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300"
            >
              Start Over
            </button>
          </div>
        )}
      </div>

      {/* Playlist Side Drawer */}
      {showPlaylist && (
        <div className="absolute right-4 top-20 bottom-24 w-80 rounded-3xl bg-slate-950/95 border border-slate-800 p-4 z-40 backdrop-blur-2xl shadow-2xl flex flex-col gap-3 overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <ListVideo className="w-4 h-4 text-purple-400" />
              Video Queue ({videoPlaylist.length})
            </h3>
            <button onClick={() => setShowPlaylist(false)} className="text-slate-400 text-xs hover:text-white">
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            {videoPlaylist.map((v) => {
              const isCurrent = v.id === item.id;
              return (
                <div
                  key={v.id}
                  onClick={() => {
                    onNavigate(v);
                    setShowPlaylist(false);
                  }}
                  className={`p-2.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-purple-600/20 border-purple-500 shadow-lg'
                      : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40'
                  }`}
                >
                  <img src={v.thumbnailUrl || v.url} alt="Cover" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <span className="text-xs font-bold text-white truncate block">{v.title}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{v.month}</span>
                  </div>
                  {isCurrent && <Sparkles className="w-4 h-4 text-purple-400 animate-pulse shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Floating Control Deck */}
      <div className="absolute bottom-4 left-4 right-4 z-30 p-4 rounded-3xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-2xl shadow-2xl flex flex-col gap-3">
        {/* Timeline Seek Bar */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-xs font-bold text-purple-300 w-12 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
          />
          <span className="text-xs font-bold text-slate-400 w-12">{formatTime(duration)}</span>
        </div>

        {/* Buttons Deck */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Play, Previous, Next */}
          <div className="flex items-center gap-2">
            {prevVideo && (
              <button
                onClick={() => onNavigate(prevVideo)}
                className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800"
                title="Previous Video"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={togglePlay}
              className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-950/80 transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </button>

            {nextVideo && (
              <button
                onClick={() => onNavigate(nextVideo)}
                className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800"
                title="Next Video"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-2xl border border-slate-800">
            <button onClick={() => setIsMuted(!isMuted)} className="text-slate-300 hover:text-white">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-20 h-1 bg-slate-700 rounded-lg appearance-none accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Playback Speed Quick Select */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
            {[0.5, 1, 1.25, 1.5, 2].map((sp) => (
              <button
                key={sp}
                onClick={() => setPlaybackSpeed(sp)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  playbackSpeed === sp ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>

          {/* Aspect Ratio Selector */}
          <button
            onClick={() => {
              const modes: ('fit' | 'fill' | '16:9' | '4:3')[] = ['fit', 'fill', '16:9', '4:3'];
              const next = modes[(modes.indexOf(aspectRatio) + 1) % modes.length];
              setAspectRatio(next);
            }}
            className="px-3 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold uppercase transition-all"
          >
            Aspect: {aspectRatio}
          </button>
        </div>
      </div>
    </div>
  );
};

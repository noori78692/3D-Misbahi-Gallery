import React, { useState, useEffect, useRef } from 'react';
import { MediaItem } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Star,
  Edit3,
  Trash2,
  Lock,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  MapPin,
  Calendar,
  HardDrive,
  Camera,
  Layers,
  Music,
} from 'lucide-react';

interface MediaLightboxProps {
  item: MediaItem;
  items: MediaItem[];
  onClose: () => void;
  onNavigate: (newItem: MediaItem) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteToTrash: (id: string) => void;
  onMoveToVault: (id: string) => void;
  onOpenEditor: (item: MediaItem) => void;
  soundEffectsEnabled: boolean;
  slideshowSpeed: number;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  item,
  items,
  onClose,
  onNavigate,
  onToggleFavorite,
  onDeleteToTrash,
  onMoveToVault,
  onOpenEditor,
  soundEffectsEnabled,
  slideshowSpeed,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [hideUi, setHideUi] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const touchStartX = useRef<number | null>(null);

  const currentIndex = items.findIndex((i) => i.id === item.id);
  const prevItem = currentIndex > 0 ? items[currentIndex - 1] : items[items.length - 1];
  const nextItem = currentIndex < items.length - 1 ? items[currentIndex + 1] : items[0];

  // Double tap handler
  const handleDoubleTap = () => {
    if (item.type !== 'photo') return;
    setZoomLevel((prev) => (prev > 1 ? 1 : 2.5));
    playSoundEffect('click', soundEffectsEnabled);
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;

    if (Math.abs(diffX) > 60) {
      if (diffX > 0 && nextItem) {
        onNavigate(nextItem);
        setZoomLevel(1);
        playSoundEffect('click', soundEffectsEnabled);
      } else if (diffX < 0 && prevItem) {
        onNavigate(prevItem);
        setZoomLevel(1);
        playSoundEffect('click', soundEffectsEnabled);
      }
    }
  };

  // Slideshow Auto Timer
  useEffect(() => {
    let timer: any;
    if (isSlideshowActive && nextItem) {
      timer = setInterval(() => {
        onNavigate(nextItem);
        playSoundEffect('click', soundEffectsEnabled);
      }, slideshowSpeed * 1000);
    }
    return () => clearInterval(timer);
  }, [isSlideshowActive, nextItem, slideshowSpeed]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && prevItem) onNavigate(prevItem);
      if (e.key === 'ArrowRight' && nextItem) onNavigate(nextItem);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevItem, nextItem]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30 p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white max-w-[200px] sm:max-w-xs truncate">{item.title}</h2>
            <p className="text-[11px] text-slate-400">{item.month} • {(item.sizeBytes / 1024 / 1024).toFixed(1)} MB</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Slideshow Button */}
          <button
            onClick={() => {
              setIsSlideshowActive(!isSlideshowActive);
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isSlideshowActive
                ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-950/80 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isSlideshowActive ? 'Pause Slideshow' : '▶ Play Slideshow'}
          </button>

          {/* Edit Button */}
          {item.type === 'photo' && (
            <button
              onClick={() => {
                onOpenEditor(item);
                playSoundEffect('click', soundEffectsEnabled);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 transition-all"
              title="Edit Photo"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {/* Favorite Toggle */}
          <button
            onClick={() => {
              onToggleFavorite(item.id);
              playSoundEffect('favorite', soundEffectsEnabled);
            }}
            className={`p-2 rounded-xl border transition-all ${
              item.isFavorite
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Favorite"
          >
            <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-300' : ''}`} />
          </button>

          {/* Info Drawer Toggle */}
          <button
            onClick={() => {
              setShowInfoDrawer(!showInfoDrawer);
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className={`p-2 rounded-xl border transition-all ${
              showInfoDrawer
                ? 'bg-purple-600 text-white border-purple-400'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="EXIF Details"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Vault & Trash Actions */}
          <button
            onClick={() => {
              onMoveToVault(item.id);
              playSoundEffect('unlock', soundEffectsEnabled);
              onClose();
            }}
            className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition-all"
            title="Move to Vault"
          >
            <Lock className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onDeleteToTrash(item.id);
              playSoundEffect('delete', soundEffectsEnabled);
              onClose();
            }}
            className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all"
            title="Trash"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Prev / Next Navigation Buttons */}
      {prevItem && (
        <button
          onClick={() => {
            onNavigate(prevItem);
            setZoomLevel(1);
            playSoundEffect('click', soundEffectsEnabled);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/80 hover:bg-purple-600 text-white border border-slate-700 transition-all shadow-2xl"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {nextItem && (
        <button
          onClick={() => {
            onNavigate(nextItem);
            setZoomLevel(1);
            playSoundEffect('click', soundEffectsEnabled);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/80 hover:bg-purple-600 text-white border border-slate-700 transition-all shadow-2xl"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Media Content Display */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setHideUi((prev) => !prev)}
        className="relative w-full h-full flex items-center justify-center p-8 overflow-hidden cursor-pointer"
      >
        {item.type === 'photo' && (
          <img
            src={item.url}
            alt={item.title}
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleDoubleTap();
            }}
            style={{ transform: `scale(${zoomLevel})` }}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl transition-transform duration-200 shadow-2xl"
          />
        )}

        {item.type === 'video' && (
          <div className="relative max-w-4xl max-h-[80vh] w-full flex flex-col items-center">
            <video
              ref={videoRef}
              src={item.url}
              controls
              autoPlay
              className="w-full max-h-[75vh] rounded-2xl shadow-2xl bg-black"
              onPlay={() => setIsPlayingVideo(true)}
              onPause={() => setIsPlayingVideo(false)}
            />
          </div>
        )}

        {item.type === 'audio' && (
          <div className="w-full max-w-lg p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col items-center text-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-950/80 animate-pulse">
              <Music className="w-12 h-12 text-white" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="text-xs text-purple-400 mt-1">{item.month} • Audio Track</p>
            </div>

            {/* Simulated Live Audio Waveform */}
            <div className="flex items-center gap-1.5 h-16 w-full px-4 bg-slate-950 rounded-2xl border border-slate-800">
              {(item.audioWaveform || [20, 50, 80, 40, 90, 100, 60, 30, 70, 85, 40, 90, 50, 20]).map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-gradient-to-t from-purple-600 to-indigo-400 rounded-full animate-pulse"
                />
              ))}
            </div>

            <audio ref={audioRef} src={item.url} controls className="w-full" />
          </div>
        )}

        {item.type === 'document' && (
          <div className="w-full max-w-xl p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Layers className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400 mt-1">PDF / Telegram Document</p>
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950/80 transition-all"
            >
              Open Document Viewer
            </a>
          </div>
        )}
      </div>

      {/* Zoom Bottom Floating Bar (for photos) */}
      {item.type === 'photo' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl z-30">
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.5, 1))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-200 px-2">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.5, 4))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* EXIF Info Slide-out Drawer */}
      {showInfoDrawer && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-2xl border-l border-slate-800/80 p-6 z-40 overflow-y-auto animate-in slide-in-from-right duration-200 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              EXIF & Media Details
            </h3>
            <button onClick={() => setShowInfoDrawer(false)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold">Title</span>
              <p className="text-sm font-bold text-slate-200 mt-0.5">{item.title}</p>
            </div>

            {item.aiDescription && (
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30">
                <span className="text-[11px] font-bold text-purple-300 uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Visual Summary
                </span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.aiDescription}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <Calendar className="w-3.5 h-3.5 text-purple-400 mb-1" />
                <span className="text-[10px] text-slate-400">Date Taken</span>
                <p className="text-xs font-bold text-slate-200 mt-0.5">{item.month}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400 mb-1" />
                <span className="text-[10px] text-slate-400">File Size</span>
                <p className="text-xs font-bold text-slate-200 mt-0.5">{(item.sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            {item.location && (
              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-200">{item.location.name}</span>
                    <p className="text-[11px] text-slate-400">{item.location.city}, {item.location.country}</p>
                  </div>
                </div>
              </div>
            )}

            {item.exif && (
              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex flex-col gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Camera Hardware</span>
                <p className="text-xs font-bold text-slate-200">{item.exif.camera || 'Samsung Galaxy S26 Ultra'}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 mt-1">
                  <div>Aperture: {item.exif.aperture || 'f/1.8'}</div>
                  <div>ISO: {item.exif.iso || '100'}</div>
                  <div>Shutter: {item.exif.shutterSpeed || '1/250s'}</div>
                  <div>Focal: {item.exif.focalLength || '24mm'}</div>
                </div>
              </div>
            )}

            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold">Tags</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.tags.map((t, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

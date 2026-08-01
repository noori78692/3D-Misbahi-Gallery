import React from 'react';
import { MediaItem } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music,
  Maximize2,
  X,
  Volume2,
} from 'lucide-react';

interface MiniAudioPlayerProps {
  activeTrack: MediaItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onOpenFullPlayer: () => void;
  onClosePlayer: () => void;
  soundEffectsEnabled: boolean;
}

export const MiniAudioPlayer: React.FC<MiniAudioPlayerProps> = ({
  activeTrack,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onOpenFullPlayer,
  onClosePlayer,
  soundEffectsEnabled,
}) => {
  if (!activeTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 p-3 rounded-2xl bg-slate-950/90 border border-purple-500/40 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-bottom-4 transition-all">
      {/* Progress Line Header */}
      <div className="absolute top-0 left-4 right-4 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div style={{ width: `${progressPercent}%` }} className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300" />
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        {/* Album Artwork & Info */}
        <div
          onClick={() => {
            onOpenFullPlayer();
            playSoundEffect('click', soundEffectsEnabled);
          }}
          className="flex items-center gap-3 cursor-pointer flex-1 overflow-hidden group"
        >
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md ${
            isPlaying ? 'animate-spin-slow' : ''
          }`}>
            <Music className="w-5 h-5 text-white" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
              {activeTrack.title}
            </h4>
            <p className="text-[10px] text-purple-400 font-medium truncate">
              {activeTrack.month} • Audio Track
            </p>
          </div>
        </div>

        {/* Media Control Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onPrevTrack}
            className="p-1.5 text-slate-300 hover:text-white transition-colors"
            title="Previous Track"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-950/80 transition-all"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>

          <button
            onClick={onNextTrack}
            className="p-1.5 text-slate-300 hover:text-white transition-colors"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenFullPlayer}
            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
            title="Expand Equalizer & Full Player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={onClosePlayer}
            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
            title="Close Audio Player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

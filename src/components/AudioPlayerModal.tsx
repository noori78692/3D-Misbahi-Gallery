import React, { useState, useEffect, useRef } from 'react';
import { MediaItem } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import { MediaStoreService } from '../services/mediaStoreService';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Sliders,
  Clock,
  ListMusic,
  Disc,
  Sparkles,
  Smartphone,
  Lock,
  Layers,
  Waves,
  Zap,
  Music,
} from 'lucide-react';

interface AudioPlayerModalProps {
  activeTrack: MediaItem;
  playlist: MediaItem[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onNavigate: (newItem: MediaItem) => void;
  onClose: () => void;
  soundEffectsEnabled: boolean;
  audioEffectsEnabled: boolean;
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({
  activeTrack,
  playlist,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onSeek,
  onNavigate,
  onClose,
  soundEffectsEnabled,
  audioEffectsEnabled,
}) => {
  const [showEq, setShowEq] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showNotificationSim, setShowNotificationSim] = useState(false);

  // Equalizer Frequencies (dB levels -12 to +12)
  const [eqPreset, setEqPreset] = useState<'normal' | 'bass' | 'vocal' | 'pop' | 'rock' | 'classical'>('normal');
  const [eqBands, setEqBands] = useState<number[]>([0, 0, 0, 0, 0]); // 60Hz, 230Hz, 910Hz, 4kHz, 14kHz
  const [spatialAudio3D, setSpatialAudio3D] = useState(true);

  // Playback Modes
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Sleep Timer (Minutes: 0, 15, 30, 45, 60)
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number>(0);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  const [fetchedAudioTracks, setFetchedAudioTracks] = useState<MediaItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (playlist.length === 0) {
      MediaStoreService.getAudio().then((tracks) => {
        if (isMounted) setFetchedAudioTracks(tracks);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [playlist]);

  const effectivePlaylist = playlist.length > 0 ? playlist : fetchedAudioTracks;
  const audioPlaylist = effectivePlaylist.filter((i) => i.type === 'audio');
  const currentIndex = audioPlaylist.findIndex((i) => i.id === activeTrack.id);

  const prevTrack = () => {
    if (audioPlaylist.length === 0) return;
    const prev = currentIndex > 0 ? audioPlaylist[currentIndex - 1] : audioPlaylist[audioPlaylist.length - 1];
    onNavigate(prev);
    playSoundEffect('click', soundEffectsEnabled);
  };

  const nextTrack = () => {
    if (audioPlaylist.length === 0) return;
    if (isShuffle) {
      const randIndex = Math.floor(Math.random() * audioPlaylist.length);
      onNavigate(audioPlaylist[randIndex]);
    } else {
      const next = currentIndex < audioPlaylist.length - 1 ? audioPlaylist[currentIndex + 1] : audioPlaylist[0];
      onNavigate(next);
    }
    playSoundEffect('click', soundEffectsEnabled);
  };

  // Preset Handler
  const handleSelectPreset = (p: 'normal' | 'bass' | 'vocal' | 'pop' | 'rock' | 'classical') => {
    setEqPreset(p);
    playSoundEffect('click', soundEffectsEnabled);
    if (p === 'normal') setEqBands([0, 0, 0, 0, 0]);
    if (p === 'bass') setEqBands([8, 6, 2, 0, -2]);
    if (p === 'vocal') setEqBands([-2, 2, 6, 4, 1]);
    if (p === 'pop') setEqBands([2, 4, 6, 3, -1]);
    if (p === 'rock') setEqBands([6, 3, -1, 4, 6]);
    if (p === 'classical') setEqBands([4, 2, 0, 3, 5]);
  };

  // Sleep timer interval
  useEffect(() => {
    let interval: any;
    if (sleepTimerRemaining !== null && sleepTimerRemaining > 0 && isPlaying) {
      interval = setInterval(() => {
        setSleepTimerRemaining((prev) => {
          if (prev !== null && prev <= 1) {
            onTogglePlay(); // stop
            return null;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sleepTimerRemaining, isPlaying]);

  const handleSetSleepTimer = (mins: number) => {
    setSleepTimerMinutes(mins);
    if (mins === 0) {
      setSleepTimerRemaining(null);
    } else {
      setSleepTimerRemaining(mins * 60);
    }
    playSoundEffect('click', soundEffectsEnabled);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200 select-none overflow-hidden">
      <div className="w-full max-w-xl rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6 flex flex-col gap-6 relative overflow-hidden">
        {/* Ambient Glow Background Accent */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between z-10 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Offline Built-in Music Engine
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  HI-RES
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Offline playback • DSP Equalizer Active</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Equalizer Modal Toggle */}
            <button
              onClick={() => {
                setShowEq(!showEq);
                playSoundEffect('click', soundEffectsEnabled);
              }}
              className={`p-2 rounded-2xl border transition-all ${
                showEq ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
              title="DSP Audio Equalizer"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Notification Widget Simulator */}
            <button
              onClick={() => {
                setShowNotificationSim(!showNotificationSim);
                playSoundEffect('click', soundEffectsEnabled);
              }}
              className={`p-2 rounded-2xl border transition-all ${
                showNotificationSim ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
              title="Notification & Lockscreen Widget Preview"
            >
              <Smartphone className="w-4 h-4" />
            </button>

            {/* Queue Toggle */}
            <button
              onClick={() => {
                setShowQueue(!showQueue);
                playSoundEffect('click', soundEffectsEnabled);
              }}
              className={`p-2 rounded-2xl border transition-all ${
                showQueue ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
              title="Track Playlist Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Vinyl Disc / Artwork Display */}
        {!showEq && !showQueue && (
          <div className="flex flex-col items-center justify-center my-4 gap-6 z-10 animate-in zoom-in-95">
            <div className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-slate-900 via-slate-950 to-purple-950 border-4 border-slate-800 shadow-2xl flex items-center justify-center p-2 transition-transform duration-500 ${
              isPlaying ? 'animate-spin-slow ring-4 ring-purple-500/30' : ''
            }`}>
              <Disc className="w-full h-full text-purple-500/40 opacity-80" />
              <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 border-4 border-slate-900 flex items-center justify-center shadow-inner">
                <Music className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Animated Audio Waveform */}
            <div className="flex items-center justify-center gap-1.5 h-12 w-full px-8 bg-slate-900/60 rounded-2xl border border-slate-800">
              {(activeTrack.audioWaveform || [20, 50, 80, 40, 90, 100, 60, 30, 70, 85, 40, 90, 50, 20]).map((h, idx) => (
                <div
                  key={idx}
                  style={{ height: isPlaying ? `${Math.max(15, Math.round(h * Math.random()))}%` : '20%' }}
                  className="flex-1 bg-gradient-to-t from-purple-600 to-indigo-400 rounded-full transition-all duration-200"
                />
              ))}
            </div>

            <div className="text-center">
              <h3 className="text-base font-extrabold text-white">{activeTrack.title}</h3>
              <p className="text-xs text-purple-400 font-semibold mt-1">
                {activeTrack.artist || 'Misbahi High Fidelity Audio'} • {activeTrack.month}
              </p>
            </div>
          </div>
        )}

        {/* DSP Equalizer Panel */}
        {showEq && (
          <div className="flex flex-col gap-4 z-10 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-purple-300 uppercase flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                5-Band Graphic Equalizer
              </span>
              <button
                onClick={() => setSpatialAudio3D(!spatialAudio3D)}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                  spatialAudio3D ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                3D Spatial Audio {spatialAudio3D ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Presets Row */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(['normal', 'bass', 'vocal', 'pop', 'rock', 'classical'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => handleSelectPreset(p)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                    eqPreset === p ? 'bg-purple-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* 5 Freq Sliders */}
            <div className="grid grid-cols-5 gap-3 pt-2 text-center">
              {['60Hz', '230Hz', '910Hz', '4kHz', '14kHz'].map((label, idx) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400">{eqBands[idx] > 0 ? `+${eqBands[idx]}` : eqBands[idx]} dB</span>
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    value={eqBands[idx]}
                    onChange={(e) => {
                      const newBands = [...eqBands];
                      newBands[idx] = parseInt(e.target.value);
                      setEqBands(newBands);
                    }}
                    className="h-28 appearance-none bg-slate-900 w-2 rounded-lg accent-purple-500 cursor-pointer"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                  />
                  <span className="text-[10px] font-bold text-purple-300">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Playlist Queue Panel */}
        {showQueue && (
          <div className="flex flex-col gap-3 z-10 animate-in fade-in max-h-60 overflow-y-auto">
            <span className="text-xs font-bold text-purple-300 uppercase flex items-center gap-2 pb-2 border-b border-slate-800">
              <ListMusic className="w-4 h-4 text-purple-400" />
              Music Queue ({audioPlaylist.length})
            </span>
            {audioPlaylist.map((t) => {
              const isCurr = t.id === activeTrack.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    onNavigate(t);
                    setShowQueue(false);
                  }}
                  className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                    isCurr ? 'bg-purple-600/20 border-purple-500 shadow-md' : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/30'
                  }`}
                >
                  <Music className={`w-5 h-5 ${isCurr ? 'text-purple-400 animate-bounce' : 'text-slate-500'}`} />
                  <div className="flex-1 overflow-hidden">
                    <span className="text-xs font-bold text-white block truncate">{t.title}</span>
                    <span className="text-[10px] text-slate-400">{t.month}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Simulated Phone Lockscreen / Notification Controller Drawer */}
        {showNotificationSim && (
          <div className="z-20 p-4 rounded-3xl bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border border-purple-500/50 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-top-3 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-purple-300 font-bold">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-purple-400" />
                Simulated Lock-Screen Media Controller
              </span>
              <button onClick={() => setShowNotificationSim(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
                  🎵
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[180px]">{activeTrack.title}</h4>
                  <p className="text-[10px] text-slate-400">Misbahi Audio Engine</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={prevTrack} className="text-slate-300 hover:text-white"><SkipBack className="w-4 h-4" /></button>
                <button onClick={onTogglePlay} className="p-2 rounded-xl bg-purple-600 text-white"><Play className="w-4 h-4 fill-white" /></button>
                <button onClick={nextTrack} className="text-slate-300 hover:text-white"><SkipForward className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Progress Slider */}
        <div className="flex items-center gap-3 w-full z-10">
          <span className="text-xs font-bold text-purple-300 w-12 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <span className="text-xs font-bold text-slate-400 w-12">{formatTime(duration)}</span>
        </div>

        {/* Controls Deck & Modes */}
        <div className="flex items-center justify-between z-10">
          {/* Shuffle Toggle */}
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-2.5 rounded-2xl border transition-all ${
              isShuffle ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous Track */}
          <button
            onClick={prevTrack}
            className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Play / Pause Main Button */}
          <button
            onClick={onTogglePlay}
            className="p-4 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-950/80 transition-all transform hover:scale-105"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </button>

          {/* Next Track */}
          <button
            onClick={nextTrack}
            className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Repeat Toggle */}
          <button
            onClick={() => {
              const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
              setRepeatMode(modes[(modes.indexOf(repeatMode) + 1) % modes.length]);
            }}
            className={`p-2.5 rounded-2xl border transition-all ${
              repeatMode !== 'off' ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="Repeat Mode"
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Sleep Timer & Speed Quick Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400 z-10">
          {/* Sleep Timer */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold">Timer:</span>
            {[0, 15, 30, 60].map((m) => (
              <button
                key={m}
                onClick={() => handleSetSleepTimer(m)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                  sleepTimerMinutes === m ? 'bg-purple-600 text-white' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {m === 0 ? 'OFF' : `${m}m`}
              </button>
            ))}
            {sleepTimerRemaining !== null && (
              <span className="text-[10px] font-bold text-emerald-400 ml-1">
                ({formatTime(sleepTimerRemaining)})
              </span>
            )}
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1">
            {[0.8, 1, 1.25, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                  playbackSpeed === s ? 'bg-purple-600 text-white' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

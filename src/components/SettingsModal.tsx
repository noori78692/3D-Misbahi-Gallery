import React, { useState } from 'react';
import { AppSettings, ThemeMode, ThemePreset } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import {
  X,
  Sun,
  Moon,
  Laptop,
  Zap,
  Film,
  Music,
  Sliders,
  Volume2,
  Cpu,
  RotateCcw,
  Grid,
  Shield,
  Check,
  ChevronDown,
  ChevronUp,
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClose: () => void;
  soundEffectsEnabled: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  soundEffectsEnabled,
}) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // Security Password Change States
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [pinMessage, setPinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const toggleCategory = (cat: string) => {
    setOpenCategory((prev) => (prev === cat ? null : cat));
    playSoundEffect('click', soundEffectsEnabled);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const activePin = settings.pinCode || '1234';

    if (currentPinInput !== activePin) {
      setPinMessage({ type: 'error', text: 'Current Password / PIN is incorrect.' });
      playSoundEffect('delete', soundEffectsEnabled);
      return;
    }
    if (!newPinInput || newPinInput.length < 4) {
      setPinMessage({ type: 'error', text: 'New PIN must be at least 4 digits.' });
      playSoundEffect('delete', soundEffectsEnabled);
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinMessage({ type: 'error', text: 'New PIN and Confirm PIN do not match.' });
      playSoundEffect('delete', soundEffectsEnabled);
      return;
    }

    onUpdateSettings({ ...settings, pinCode: newPinInput });
    setPinMessage({ type: 'success', text: 'Vault Password / PIN changed successfully!' });
    playSoundEffect('unlock', soundEffectsEnabled);
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  const themeModes: { id: ThemeMode; label: string; desc: string; icon: any }[] = [
    { id: 'light', label: 'Light Mode', desc: 'Clean bright layout with high contrast dark text', icon: Sun },
    { id: 'dark', label: 'Dark Mode', desc: 'Futuristic slate twilight theme for eye comfort', icon: Moon },
    { id: 'system', label: 'System Default', desc: 'Syncs automatically with device system preference', icon: Laptop },
    { id: 'amoled', label: 'AMOLED Black', desc: 'Pure #000000 black canvas to save OLED battery', icon: Zap },
  ];

  const themePresets: { id: ThemePreset; name: string; gradient: string }[] = [
    { id: 'cyber_violet', name: 'Cyber Violet', gradient: 'from-purple-600 to-indigo-600' },
    { id: 'oled_black', name: 'OLED Pure Black', gradient: 'from-slate-900 to-black' },
    { id: 'sapphire_blue', name: 'Sapphire Blue', gradient: 'from-blue-600 to-cyan-600' },
    { id: 'emerald_green', name: 'Emerald Green', gradient: 'from-emerald-600 to-teal-600' },
    { id: 'sunset_gold', name: 'Sunset Gold', gradient: 'from-amber-600 to-orange-600' },
  ];

  const handleToggle = (key: keyof AppSettings) => {
    const val = !settings[key];
    onUpdateSettings({ ...settings, [key]: val });
    playSoundEffect('click', soundEffectsEnabled);
  };

  const isLight = settings.themeMode === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900'
          : settings.themeMode === 'amoled'
          ? 'bg-black border-slate-800 text-slate-100'
          : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-2xl border transition-all ${
              isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Content (Accordion Categories) */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* CATEGORY 1: THEMES */}
          <div className="rounded-2xl border overflow-hidden transition-all border-slate-700/50">
            <button
              onClick={() => toggleCategory('themes')}
              className={`w-full flex items-center justify-between p-4 transition-all text-left ${
                openCategory === 'themes'
                  ? 'bg-purple-600/10 border-b border-purple-500/30'
                  : isLight
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                  : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Sun className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Themes & Appearance</h3>
                  <p className="text-[11px] text-slate-400">Dark mode, light mode, color presets</p>
                </div>
              </div>
              {openCategory === 'themes' ? (
                <ChevronUp className="w-5 h-5 text-purple-400 shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
              )}
            </button>

            {openCategory === 'themes' && (
              <div className="p-4 space-y-5 animate-in fade-in duration-200">
                {/* Theme Mode Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">
                    Theme Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {themeModes.map((mode) => {
                      const Icon = mode.icon;
                      const isSelected = settings.themeMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => {
                            onUpdateSettings({
                              ...settings,
                              themeMode: mode.id,
                              isDarkMode: mode.id !== 'light',
                            });
                            playSoundEffect('click', soundEffectsEnabled);
                          }}
                          className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                            isSelected
                              ? 'bg-purple-600/15 border-purple-500 ring-2 ring-purple-500/40 shadow-lg'
                              : isLight
                              ? 'bg-slate-50 border-slate-200 hover:border-purple-300'
                              : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                          }`}
                        >
                          <div className={`p-2 rounded-xl text-white ${
                            isSelected ? 'bg-purple-600' : isLight ? 'bg-slate-300 text-slate-700' : 'bg-slate-800 text-slate-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold">{mode.label}</span>
                              {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{mode.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Accent Presets */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">
                    Color Accent Preset
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {themePresets.map((preset) => {
                      const isSelected = settings.theme === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            onUpdateSettings({ ...settings, theme: preset.id });
                            playSoundEffect('click', soundEffectsEnabled);
                          }}
                          className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all ${
                            isSelected
                              ? 'bg-purple-600/10 border-purple-500 ring-2 ring-purple-500/30'
                              : isLight
                              ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                              : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${preset.gradient} shadow-md shrink-0`} />
                          <span className="text-xs font-bold truncate">{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CATEGORY 2: PLAYERS */}
          <div className="rounded-2xl border overflow-hidden transition-all border-slate-700/50">
            <button
              onClick={() => toggleCategory('players')}
              className={`w-full flex items-center justify-between p-4 transition-all text-left ${
                openCategory === 'players'
                  ? 'bg-indigo-600/10 border-b border-indigo-500/30'
                  : isLight
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                  : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Film className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Built-in Media Players</h3>
                  <p className="text-[11px] text-slate-400">Video player, audio player, equalizer</p>
                </div>
              </div>
              {openCategory === 'players' ? (
                <ChevronUp className="w-5 h-5 text-indigo-400 shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
              )}
            </button>

            {openCategory === 'players' && (
              <div className="p-4 space-y-4 animate-in fade-in duration-200">
                {/* Built-in Video Player */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                      <Film className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">Built-in Video Player</span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Play MP4, MKV, AVI, MOV inside the gallery with PiP, gesture controls, and subtitles.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('builtInVideoPlayerEnabled')}
                    className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${
                      settings.builtInVideoPlayerEnabled ? 'bg-purple-600' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all absolute top-0.5 ${
                      settings.builtInVideoPlayerEnabled ? 'left-6' : 'left-0.5'
                    }`} />
                  </button>
                </div>

                {/* Built-in Audio Player */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">Built-in Music & Audio Player</span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Play MP3, AAC, FLAC, WAV with mini player and equalizer presets.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('builtInAudioPlayerEnabled')}
                    className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${
                      settings.builtInAudioPlayerEnabled ? 'bg-purple-600' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all absolute top-0.5 ${
                      settings.builtInAudioPlayerEnabled ? 'left-6' : 'left-0.5'
                    }`} />
                  </button>
                </div>

                {/* Audio Effects */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">Audio Effects & Equalizer</span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Enables 5-band audio equalizer, bass boost, and 3D spatial sound processing.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('audioEffectsEnabled')}
                    className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${
                      settings.audioEffectsEnabled ? 'bg-purple-600' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all absolute top-0.5 ${
                      settings.audioEffectsEnabled ? 'left-6' : 'left-0.5'
                    }`} />
                  </button>
                </div>

                {/* Hardware Acceleration */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">Hardware Acceleration</span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Uses GPU acceleration for smooth 4K video rendering.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('hardwareAcceleration')}
                    className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${
                      settings.hardwareAcceleration ? 'bg-purple-600' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all absolute top-0.5 ${
                      settings.hardwareAcceleration ? 'left-6' : 'left-0.5'
                    }`} />
                  </button>
                </div>

                {/* Auto Resume */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">Auto Resume Playback</span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Remembers where you left off on videos and audio tracks.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('autoResumeMedia')}
                    className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${
                      settings.autoResumeMedia ? 'bg-purple-600' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all absolute top-0.5 ${
                      settings.autoResumeMedia ? 'left-6' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CATEGORY 3: GRID & 3D */}
          <div className="rounded-2xl border overflow-hidden transition-all border-slate-700/50">
            <button
              onClick={() => toggleCategory('grid')}
              className={`w-full flex items-center justify-between p-4 transition-all text-left ${
                openCategory === 'grid'
                  ? 'bg-cyan-600/10 border-b border-cyan-500/30'
                  : isLight
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                  : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Grid className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Grid & 3D Settings</h3>
                  <p className="text-[11px] text-slate-400">Columns density, slideshow speed, ambient audio</p>
                </div>
              </div>
              {openCategory === 'grid' ? (
                <ChevronUp className="w-5 h-5 text-cyan-400 shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
              )}
            </button>

            {openCategory === 'grid' && (
              <div className="p-4 space-y-4 animate-in fade-in duration-200">
                {/* 90 FPS / 120Hz Ultra High Refresh Rate Toggle */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                      <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold block">120Hz / 90 FPS Ultra Refresh Rate</span>
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          90 FPS Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Forces high performance WebGL delta animation loop optimized for 90Hz and 120Hz gaming/AMOLED displays.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('highFps120Hz')}
                    className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${
                      settings.highFps120Hz !== false ? 'bg-emerald-600' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all absolute top-0.5 ${
                      settings.highFps120Hz !== false ? 'left-6' : 'left-0.5'
                    }`} />
                  </button>
                </div>

                {/* Background Music */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">Background Music (3D Gallery)</span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Plays ambient music when navigating the 3D Matrix gallery mode.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('backgroundMusicEnabled')}
                    className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${
                      settings.backgroundMusicEnabled ? 'bg-purple-600' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all absolute top-0.5 ${
                      settings.backgroundMusicEnabled ? 'left-6' : 'left-0.5'
                    }`} />
                  </button>
                </div>

                {/* Grid Columns */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">
                    Default Grid Density
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[2, 3, 4, 6].map((cols) => (
                      <button
                        key={cols}
                        onClick={() => {
                          onUpdateSettings({ ...settings, gridColumns: cols });
                          playSoundEffect('click', soundEffectsEnabled);
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          settings.gridColumns === cols
                            ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                            : isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-700'
                            : 'bg-slate-800/40 border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="text-base font-black block">{cols}x</span>
                        <span className="text-[10px] opacity-80">Columns</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slideshow Speed */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">
                    Slideshow Interval Speed
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[2, 3, 5, 10].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => {
                          onUpdateSettings({ ...settings, slideshowSpeed: sec });
                          playSoundEffect('click', soundEffectsEnabled);
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          settings.slideshowSpeed === sec
                            ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                            : isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-700'
                            : 'bg-slate-800/40 border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="text-base font-black block">{sec}s</span>
                        <span className="text-[10px] opacity-80">Per Photo</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CATEGORY 4: SECURITY */}
          <div className="rounded-2xl border overflow-hidden transition-all border-slate-700/50">
            <button
              onClick={() => toggleCategory('security')}
              className={`w-full flex items-center justify-between p-4 transition-all text-left ${
                openCategory === 'security'
                  ? 'bg-emerald-600/10 border-b border-emerald-500/30'
                  : isLight
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                  : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Shield className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Security & Vault</h3>
                  <p className="text-[11px] text-slate-400">Protected vault PIN security</p>
                </div>
              </div>
              {openCategory === 'security' ? (
                <ChevronUp className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
              )}
            </button>

            {openCategory === 'security' && (
              <div className="p-4 space-y-4 animate-in fade-in duration-200">
                {/* Active PIN indicator */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <Lock className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">Vault Security Protection</span>
                      <p className="text-xs text-slate-400">PIN protection is active for private photos & videos</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </div>

                {/* Change Password / PIN Form */}
                <div className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-purple-400" />
                      <h4 className="text-sm font-bold">Change Vault Password / PIN</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="text-xs text-slate-400 hover:text-purple-400 flex items-center gap-1 transition-colors"
                    >
                      {showPasswords ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Show
                        </>
                      )}
                    </button>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Current Password / PIN
                      </label>
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        maxLength={10}
                        placeholder="Enter current PIN (Default: 1234)"
                        value={currentPinInput}
                        onChange={(e) => {
                          setCurrentPinInput(e.target.value);
                          if (pinMessage) setPinMessage(null);
                        }}
                        className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">
                          New Password / PIN
                        </label>
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          maxLength={10}
                          placeholder="Enter new 4-digit PIN"
                          value={newPinInput}
                          onChange={(e) => {
                            setNewPinInput(e.target.value);
                            if (pinMessage) setPinMessage(null);
                          }}
                          className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          maxLength={10}
                          placeholder="Re-enter new PIN"
                          value={confirmPinInput}
                          onChange={(e) => {
                            setConfirmPinInput(e.target.value);
                            if (pinMessage) setPinMessage(null);
                          }}
                          className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                          }`}
                        />
                      </div>
                    </div>

                    {pinMessage && (
                      <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
                        pinMessage.type === 'success'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {pinMessage.type === 'success' ? (
                          <CheckCircle className="w-4 h-4 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0" />
                        )}
                        <span>{pinMessage.text}</span>
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Default PIN is 1234</span>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Key className="w-3.5 h-3.5" /> Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
        }`}>
          <span className="text-xs text-slate-400">Settings saved automatically to device storage</span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};


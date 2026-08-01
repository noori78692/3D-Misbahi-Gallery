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
  Play,
  Shield,
  Check,
  Sparkles,
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
  const [activeTab, setActiveTab] = useState<'appearance' | 'players' | 'gallery' | 'security'>('appearance');

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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Preferences & Media Settings
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  FLAGSHIP
                </span>
              </h2>
              <p className="text-xs text-slate-400">Configure appearance, built-in players, and audio options</p>
            </div>
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

        {/* Tab Navigation */}
        <div className={`flex items-center gap-1 p-2 border-b overflow-x-auto scrollbar-none ${
          isLight ? 'bg-slate-100/80 border-slate-200' : 'bg-slate-950/40 border-slate-800'
        }`}>
          {[
            { id: 'appearance', label: 'Appearance & Themes', icon: Sun },
            { id: 'players', label: 'Built-in Players', icon: Film },
            { id: 'gallery', label: 'Gallery Grid & 3D', icon: Grid },
            { id: 'security', label: 'Security & Vault', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  playSoundEffect('click', soundEffectsEnabled);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Theme Mode Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-3">
                  1. Choose Theme Mode
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
                        className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
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
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">{mode.label}</span>
                            {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{mode.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Theme Color Accent Presets */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-3">
                  2. Accent Color Preset
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
                        className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                          isSelected
                            ? 'bg-purple-600/10 border-purple-500 ring-2 ring-purple-500/30'
                            : isLight
                            ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                            : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${preset.gradient} shadow-md shrink-0`} />
                        <span className="text-xs font-bold truncate">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'players' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <span>All built-in media player options run 100% offline without external app redirects.</span>
              </div>

              {/* Built-in Video Player Toggle */}
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
                      Play MP4, MKV, AVI, MOV, WEBM inside the gallery with PiP, gesture brightness & volume, subtitles, and resume playback.
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

              {/* Built-in Music & Audio Player Toggle */}
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
                      Play MP3, AAC, FLAC, WAV with mini player, equalizer presets, playlists, and sleep timer. (If OFF, hides Audio section).
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

              {/* Audio Effects Toggle */}
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
                      Uses GPU acceleration for ultra-smooth 4K video rendering and 60fps 3D matrix.
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

              {/* Auto Resume Playback */}
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
                      Remembers where you left off on videos and audio tracks and offers seamless resume.
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

          {activeTab === 'gallery' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Background Music for 3D Gallery */}
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
                      Plays ambient generative background music when navigating the 3D Matrix gallery mode.
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
                <label className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-2">
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
                <label className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-2">
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

          {activeTab === 'security' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className={`p-4 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-bold">Protected Vault Security PIN</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Current PIN code is required to unlock your protected media vault.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="password"
                    maxLength={4}
                    value={settings.pinCode || '1234'}
                    onChange={(e) => onUpdateSettings({ ...settings, pinCode: e.target.value })}
                    className={`w-32 px-4 py-2 rounded-xl text-center text-lg font-bold tracking-widest border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                  <span className="text-xs text-emerald-400 font-semibold">Saved & Active</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
        }`}>
          <span className="text-xs text-slate-400">Settings saved permanently to device storage</span>
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

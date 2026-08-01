import React, { useState } from 'react';
import { AppSettings, ThemeMode, ThemePreset } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import {
  Sun,
  Moon,
  Laptop,
  Zap,
  Film,
  Music,
  Sliders,
  Volume2,
  Cpu,
  Grid,
  Shield,
  Check,
  Trash2,
  FolderTree,
  Calendar,
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react';

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenVault: () => void;
  onOpenTrash: () => void;
  soundEffectsEnabled: boolean;
  isLight: boolean;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  onOpenVault,
  onOpenTrash,
  soundEffectsEnabled,
  isLight,
}) => {
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
          Settings & Preferences
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            FLAGSHIP
          </span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Customize display themes, media players, layout density, security vault, and audio effects
        </p>
      </div>

      {/* 1. Theme & Appearance */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-2">
          <Sun className="w-4 h-4" />
          Display Theme & Color Modes
        </h3>

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
                className={`p-4 rounded-3xl border text-left flex items-start gap-3.5 transition-all shadow-sm ${
                  isSelected
                    ? 'bg-purple-600/15 border-purple-500 ring-2 ring-purple-500/30'
                    : isLight
                    ? 'bg-white border-slate-200 hover:border-purple-300'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-2.5 rounded-2xl text-white ${
                  isSelected ? 'bg-purple-600' : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{mode.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-purple-500" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {mode.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Accent Color Presets */}
        <div className="pt-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
            Accent Color Palette
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
                      ? 'bg-purple-500/15 border-purple-500 ring-2 ring-purple-500/30'
                      : isLight
                      ? 'bg-white border-slate-200 hover:bg-slate-50'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${preset.gradient} shadow-md shrink-0`} />
                  <span className="text-xs font-bold truncate">{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Built-in Media Players Configuration */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-2">
          <Film className="w-4 h-4" />
          Media Players & Audio Engine
        </h3>

        {/* Video Player Toggle */}
        <div className={`p-4 rounded-3xl border flex items-center justify-between gap-4 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold block">Built-in Video Player</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                MX/VLC gesture controls, volume/brightness swipe, PiP, speed, subtitles
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

        {/* Music Player Toggle */}
        <div className={`p-4 rounded-3xl border flex items-center justify-between gap-4 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold block">Built-in Music & Audio Player</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mini player, now playing screen, waveform, shuffle, repeat, sleep timer (Hides Audio tab if OFF)
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

        {/* 3D Background Music Toggle */}
        <div className={`p-4 rounded-3xl border flex items-center justify-between gap-4 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold block">3D Background Ambient Music</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Plays generative ambient synthesizer soundtrack when navigating the 3D Experience mode
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

        {/* Audio Effects Toggle */}
        <div className={`p-4 rounded-3xl border flex items-center justify-between gap-4 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold block">DSP Equalizer & Spatial Sound</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Enables 5-band frequency tuning and 3D spatial sound processing
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
      </section>

      {/* 3. Grid, Layout & View Modes */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-2">
          <Grid className="w-4 h-4" />
          Grid Layout & Thumbnail Density
        </h3>

        {/* Columns Grid Density */}
        <div className={`p-4 rounded-3xl border shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
            Thumbnail Grid Columns
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[2, 3, 4, 6].map((cols) => (
              <button
                key={cols}
                onClick={() => {
                  onUpdateSettings({ ...settings, gridColumns: cols });
                  playSoundEffect('click', soundEffectsEnabled);
                }}
                className={`py-2.5 rounded-2xl border text-center font-bold text-xs transition-all ${
                  settings.gridColumns === cols
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                    : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-700'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300'
                }`}
              >
                {cols} Columns
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Grouping Option */}
        <div className={`p-4 rounded-3xl border shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
            Smart Timeline Grouping
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'day', label: 'By Day' },
              { id: 'month', label: 'By Month' },
              { id: 'year', label: 'By Year' },
            ].map((group) => {
              const isSel = (settings.timelineGrouping || 'month') === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => {
                    onUpdateSettings({ ...settings, timelineGrouping: group.id as any });
                    playSoundEffect('click', soundEffectsEnabled);
                  }}
                  className={`py-2.5 rounded-2xl border text-center font-bold text-xs transition-all ${
                    isSel
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                      : isLight
                      ? 'bg-slate-100 border-slate-200 text-slate-700'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300'
                  }`}
                >
                  {group.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Folder View Toggle */}
        <div className={`p-4 rounded-3xl border flex items-center justify-between gap-4 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold block">Folder View Hierarchy</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Organize photos directly by disk directory structure and system folders
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('folderViewEnabled')}
            className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${
              settings.folderViewEnabled ? 'bg-purple-600' : 'bg-slate-700'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-all absolute top-0.5 ${
              settings.folderViewEnabled ? 'left-6' : 'left-0.5'
            }`} />
          </button>
        </div>
      </section>

      {/* 4. Vault & Security */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Security, Vault & Recycle Bin
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => {
              onOpenVault();
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className={`p-4 rounded-3xl border text-left flex items-center gap-3.5 transition-all shadow-sm ${
              isLight ? 'bg-white border-slate-200 hover:border-indigo-400' : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/40'
            }`}
          >
            <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-500 border border-indigo-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-bold block">Protected Vault</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage PIN & hidden photos</p>
            </div>
          </button>

          <button
            onClick={() => {
              onOpenTrash();
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className={`p-4 rounded-3xl border text-left flex items-center gap-3.5 transition-all shadow-sm ${
              isLight ? 'bg-white border-slate-200 hover:border-rose-400' : 'bg-slate-900/80 border-slate-800 hover:border-rose-500/40'
            }`}
          >
            <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-500 border border-rose-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-bold block">Recycle Bin</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Recover or permanently erase items</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};

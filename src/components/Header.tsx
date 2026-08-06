import React, { useState } from 'react';
import { ViewMode, AppSettings } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import {
  Sparkles,
  Search,
  Lock,
  Settings,
  MoreVertical,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface HeaderProps {
  activeTabTitle: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpen3DExperience: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenUpload?: () => void;
  onOpenVault: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTabTitle,
  searchQuery,
  onSearchChange,
  onOpen3DExperience,
  settings,
  onUpdateSettings,
  onOpenUpload,
  onOpenVault,
  onOpenSettings,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isLight = settings.themeMode === 'light';

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-2xl border-b px-4 py-3 select-none transition-all ${
      isLight
        ? 'bg-white/90 border-slate-200/80 text-slate-900 shadow-sm'
        : settings.themeMode === 'amoled'
        ? 'bg-black/90 border-slate-800/80 text-slate-100'
        : 'bg-slate-950/90 border-slate-800/80 text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: App Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg sm:text-2xl font-black tracking-tight flex items-center gap-2 min-w-0">
            <span className="truncate">Gallery</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20 whitespace-nowrap shrink-0">
              {activeTabTitle}
            </span>
          </h1>
        </div>

        {/* Center / Right: Search Input + 3D Button + Options Menu */}
        <div className="flex items-center gap-2">
          {/* Expanded or Compact Search */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center gap-2">
                <div className="relative min-w-[200px] sm:min-w-[280px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search photos, dates, tags..."
                    className={`w-full pl-9 pr-8 py-1.5 rounded-2xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${
                      isLight
                        ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    onSearchChange('');
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsSearchOpen(true);
                  playSoundEffect('click', settings.soundEffectsEnabled);
                }}
                className={`p-2 rounded-2xl border transition-all ${
                  isLight
                    ? 'bg-slate-100/80 border-slate-200 text-slate-700 hover:bg-slate-200/80'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 3D Experience Button */}
          <button
            onClick={() => {
              onOpen3DExperience();
              playSoundEffect('click', settings.soundEffectsEnabled);
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-extrabold shadow-lg shadow-purple-950/40 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white/20 animate-pulse" />
            <span className="hidden sm:inline">✨ 3D Experience</span>
            <span className="sm:hidden">3D</span>
          </button>

          {/* More Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                playSoundEffect('click', settings.soundEffectsEnabled);
              }}
              className={`p-2 rounded-2xl border transition-all ${
                isLight
                  ? 'bg-slate-100/80 border-slate-200 text-slate-700 hover:bg-slate-200/80'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
              title="More Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className={`absolute right-0 mt-2 w-56 rounded-3xl border shadow-2xl z-50 p-2 space-y-1 animate-in zoom-in-95 duration-150 ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                }`}>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenVault();
                      playSoundEffect('click', settings.soundEffectsEnabled);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all ${
                      isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                    }`}
                  >
                    <Lock className="w-4 h-4 text-indigo-400" />
                    Protected Vault
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenSettings();
                      playSoundEffect('click', settings.soundEffectsEnabled);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all ${
                      isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Settings
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};


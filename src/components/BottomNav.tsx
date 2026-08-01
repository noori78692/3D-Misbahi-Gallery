import React from 'react';
import { MainTab } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import {
  Image,
  Film,
  FolderHeart,
  Music,
  Settings,
  Sparkles,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onOpen3DExperience: () => void;
  soundEffectsEnabled: boolean;
  isLight: boolean;
  hasAudioTab: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpen3DExperience,
  soundEffectsEnabled,
  isLight,
  hasAudioTab,
}) => {
  const tabs: { id: MainTab; label: string; icon: any }[] = [
    { id: 'photos', label: 'Photos', icon: Image },
    { id: 'videos', label: 'Videos', icon: Film },
    { id: 'albums', label: 'Albums', icon: FolderHeart },
    ...(hasAudioTab ? [{ id: 'audio' as MainTab, label: 'Audio', icon: Music }] : []),
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
      <div
        className={`max-w-md sm:max-w-lg mx-auto mb-2 px-3 py-2 rounded-3xl border backdrop-blur-2xl shadow-2xl transition-all duration-300 flex items-center justify-between ${
          isLight
            ? 'bg-white/90 border-slate-200/80 text-slate-800 shadow-slate-200/60'
            : 'bg-slate-950/90 border-slate-800/80 text-slate-100 shadow-black/80'
        }`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                playSoundEffect('click', soundEffectsEnabled);
              }}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-purple-600 dark:text-purple-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              {/* Material 3 Active Indicator Pill */}
              {isActive && (
                <div className="absolute inset-x-2 top-0 bottom-0 bg-purple-500/15 dark:bg-purple-500/20 rounded-2xl -z-10 animate-in zoom-in-90 duration-200" />
              )}

              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'scale-110 text-purple-600 dark:text-purple-400' : ''
                }`}
              />
              <span className="text-[11px] mt-0.5 tracking-tight truncate max-w-[64px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

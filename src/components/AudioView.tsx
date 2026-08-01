import React, { useState } from 'react';
import { MediaItem } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import {
  Music,
  Play,
  Pause,
  Disc,
  Sparkles,
  Clock,
  Search,
  Filter,
} from 'lucide-react';

interface AudioViewProps {
  mediaItems: MediaItem[];
  activeAudioItem: MediaItem | null;
  isPlaying: boolean;
  onSelectTrack: (item: MediaItem) => void;
  onTogglePlay: () => void;
  soundEffectsEnabled: boolean;
  isLight: boolean;
}

export const AudioView: React.FC<AudioViewProps> = ({
  mediaItems,
  activeAudioItem,
  isPlaying,
  onSelectTrack,
  onTogglePlay,
  soundEffectsEnabled,
  isLight,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const audioTracks = mediaItems.filter(
    (i) => i.type === 'audio' && !i.isInTrash && !i.isHidden
  );

  const filteredTracks = audioTracks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.artist && t.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTime = (secs?: number) => {
    if (!secs) return '3:45';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-28 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2 flex-wrap">
            <span className="whitespace-nowrap">Audio & Music Tracks</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20 whitespace-nowrap">
              {audioTracks.length} Tracks
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Built-in high fidelity offline music player library
          </p>
        </div>

        {/* Search Field */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search music, podcast, audio..."
            className={`w-full pl-10 pr-4 py-2 rounded-2xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                : 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500'
            }`}
          />
        </div>
      </div>

      {/* Featured Banner / Quick Start */}
      {filteredTracks.length > 0 && (
        <div className={`p-5 rounded-3xl border relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isLight
            ? 'bg-gradient-to-r from-purple-900 to-indigo-900 text-white border-purple-800'
            : 'bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white border-purple-500/30'
        }`}>
          <div className="flex items-center gap-4 z-10">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 shadow-xl flex items-center justify-center shrink-0 ${
              isPlaying ? 'animate-spin-slow' : ''
            }`}>
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-purple-400">
                <Disc className="w-8 h-8" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 uppercase tracking-wider">
                FEATURED ALBUM TRACK
              </span>
              <h3 className="text-base font-extrabold mt-1 truncate max-w-xs sm:max-w-md">
                {activeAudioItem?.title || filteredTracks[0].title}
              </h3>
              <p className="text-xs text-purple-300 mt-0.5">
                {activeAudioItem?.artist || filteredTracks[0].artist || 'Misbahi Audio Studio'} • {activeAudioItem?.month || filteredTracks[0].month}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const trackToPlay = activeAudioItem || filteredTracks[0];
              if (activeAudioItem?.id === trackToPlay.id && isPlaying) {
                onTogglePlay();
              } else {
                onSelectTrack(trackToPlay);
              }
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className="px-5 py-2.5 rounded-2xl bg-white text-slate-900 font-extrabold text-xs shadow-xl hover:bg-slate-100 transition-all flex items-center gap-2 shrink-0 z-10"
          >
            {activeAudioItem && isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-slate-900" />
                Pause Music
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-900 ml-0.5" />
                Play Featured
              </>
            )}
          </button>
        </div>
      )}

      {/* Track List */}
      <div className={`rounded-3xl border overflow-hidden shadow-sm ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
          {filteredTracks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Music className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-sm font-semibold">No audio tracks found</p>
            </div>
          ) : (
            filteredTracks.map((track, idx) => {
              const isSelected = activeAudioItem?.id === track.id;
              const isCurrPlaying = isSelected && isPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    if (isSelected) {
                      onTogglePlay();
                    } else {
                      onSelectTrack(track);
                    }
                    playSoundEffect('click', soundEffectsEnabled);
                  }}
                  className={`p-3.5 flex items-center justify-between gap-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-500/10 dark:bg-purple-500/20'
                      : isLight
                      ? 'hover:bg-slate-50'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-400 w-5 text-center shrink-0">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>

                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md ${
                      isCurrPlaying ? 'animate-spin-slow' : ''
                    }`}>
                      <Music className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs font-bold truncate ${
                        isSelected ? 'text-purple-600 dark:text-purple-400' : ''
                      }`}>
                        {track.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {track.artist || 'Misbahi High Fidelity Audio'} • {track.month}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(track.duration)}
                    </span>

                    <button className={`p-2 rounded-xl transition-all ${
                      isCurrPlaying
                        ? 'bg-purple-600 text-white shadow-md'
                        : isLight
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}>
                      {isCurrPlaying ? (
                        <Pause className="w-4 h-4 fill-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

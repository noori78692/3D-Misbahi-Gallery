import React, { useMemo } from 'react';
import { MediaItem } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import { formatMediaUrl } from '../utils/mediaUtils';
import {
  Grid,
  Check,
  Star,
  Trash2,
  Lock,
  Tag,
  Share2,
  Play,
  Music,
  FileText,
  Smartphone,
  CheckSquare,
  Square,
  Sparkles,
  MapPin,
  Clock,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

interface Gallery2DProps {
  items: MediaItem[];
  selectedItemIds: string[];
  onToggleSelectItem: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSelectMedia: (item: MediaItem) => void;
  onBatchDelete: () => void;
  onBatchFavorite: () => void;
  onBatchHideVault: () => void;
  gridColumns: number;
  onChangeGridColumns: (cols: number) => void;
  soundEffectsEnabled: boolean;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onScanComplete?: (newItems: MediaItem[]) => void;
}

export const Gallery2D: React.FC<Gallery2DProps> = ({
  items,
  selectedItemIds,
  onToggleSelectItem,
  onSelectAll,
  onClearSelection,
  onSelectMedia,
  onBatchDelete,
  onBatchFavorite,
  onBatchHideVault,
  gridColumns,
  onChangeGridColumns,
  soundEffectsEnabled,
  activeCategory,
  onSelectCategory,
  onScanComplete,
}) => {
  const isMultiSelectMode = selectedItemIds.length > 0;

  // Group items by Date / Month / Year or Date string
  const groupedItems = useMemo(() => {
    return items.reduce((acc, item) => {
      const key = item.month || 'Other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, MediaItem[]>);
  }, [items]);


  const gridColsClass = {
    2: 'grid-cols-2 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4',
    4: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6',
    6: 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10',
  }[gridColumns] || 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6';

  return (
    <div className="flex flex-col gap-4">


      {/* Multi-Select Action Top Bar */}
      {isMultiSelectMode && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-purple-900/90 to-indigo-900/90 border border-purple-500/40 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <button
              onClick={onClearSelection}
              className="p-1.5 rounded-xl bg-purple-950 text-purple-300 hover:bg-purple-900 border border-purple-700/50"
            >
              ✕
            </button>
            <span className="text-sm font-bold text-white">
              {selectedItemIds.length} Selected
            </span>
            <button
              onClick={onSelectAll}
              className="text-xs text-purple-300 hover:underline font-medium"
            >
              Select All ({items.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onBatchFavorite();
                playSoundEffect('favorite', soundEffectsEnabled);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/30 transition-all"
            >
              <Star className="w-3.5 h-3.5 fill-amber-300" />
              Favorite
            </button>
            <button
              onClick={() => {
                onBatchHideVault();
                playSoundEffect('unlock', soundEffectsEnabled);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-semibold hover:bg-indigo-500/30 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              Vault
            </button>
            <button
              onClick={() => {
                onBatchDelete();
                playSoundEffect('delete', soundEffectsEnabled);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold hover:bg-rose-500/30 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Trash
            </button>
          </div>
        </div>
      )}

      {/* Main Grid View Grouped by Month */}
      {Object.keys(groupedItems).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4 shadow-xl">
            <ImageIcon className="w-8 h-8 text-purple-400/80" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 mb-1">No Media Found</h3>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            Your media gallery is currently empty or no items match the active category filter.
          </p>
        </div>
      ) : (
        (Object.entries(groupedItems) as [string, MediaItem[]][]).map(([monthGroup, groupItems]) => (
          <div key={monthGroup} className="flex flex-col gap-2">
            {/* Section Date Header */}
            <div className="flex items-center gap-2 pt-2 px-1">
              <Clock className="w-4 h-4 text-purple-400" />
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{monthGroup}</h2>
              <span className="text-[11px] text-slate-500 font-semibold">({groupItems.length})</span>
              <div className="flex-1 h-[1px] bg-slate-800/80" />
            </div>

            {/* Grid Container */}
            <div className={`grid ${gridColsClass} gap-2.5`}>
              {groupItems.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isMultiSelectMode) {
                        onToggleSelectItem(item.id);
                      } else {
                        onSelectMedia(item);
                        playSoundEffect('click', soundEffectsEnabled);
                      }
                    }}
                    className={`group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border cursor-pointer select-none transition-all duration-200 transform hover:scale-[1.02] ${
                      isSelected
                        ? 'border-purple-500 ring-2 ring-purple-500/60 shadow-lg shadow-purple-950/80 scale-[0.98]'
                        : 'border-slate-800 hover:border-purple-500/50 hover:shadow-xl'
                    }`}
                  >
                    {/* Media Thumbnail */}
                    {item.type === 'photo' || item.type === 'video' ? (
                      <img
                        src={formatMediaUrl(item.thumbnailUrl || item.url)}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : item.type === 'audio' ? (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex flex-col items-center justify-center p-3 text-center">
                        <Music className="w-8 h-8 text-purple-400 mb-2 transition-transform group-hover:scale-110" />
                        <span className="text-xs font-bold text-slate-200 line-clamp-2">{item.title}</span>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-3 text-center">
                        <FileText className="w-8 h-8 text-cyan-400 mb-2" />
                        <span className="text-xs font-bold text-slate-200 line-clamp-2">{item.title}</span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Type Badges */}
                    {item.type === 'video' && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white">
                        <Play className="w-2.5 h-2.5 fill-white" />
                        {item.duration ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : '4K'}
                      </div>
                    )}

                    {item.source === 'whatsapp' && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-lg bg-emerald-600/80 text-[10px] font-bold text-white shadow">
                        WA
                      </div>
                    )}

                    {item.source === 'telegram' && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-lg bg-sky-600/80 text-[10px] font-bold text-white shadow">
                        TG
                      </div>
                    )}

                    {/* Location Badge */}
                    {item.location && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 max-w-[70%] text-[10px] font-medium text-slate-200 truncate drop-shadow-md">
                        <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                        <span className="truncate">{item.location.city}</span>
                      </div>
                    )}

                    {/* Favorite Star */}
                    {item.isFavorite && (
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-amber-500/80 text-white shadow-md">
                        <Star className="w-3 h-3 fill-white" />
                      </div>
                    )}

                    {/* Multi-Select Checkbox Overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelectItem(item.id);
                        playSoundEffect('click', soundEffectsEnabled);
                      }}
                      className={`absolute top-2 left-2 p-1 rounded-xl transition-all ${
                        isMultiSelectMode || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-purple-400 fill-purple-950" />
                      ) : (
                        <Square className="w-5 h-5 text-white/80 drop-shadow-md" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

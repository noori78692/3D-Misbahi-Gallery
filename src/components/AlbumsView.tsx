import React, { useState } from 'react';
import { Album, MediaItem } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import {
  FolderHeart,
  Heart,
  Lock,
  Trash2,
  Camera,
  Smartphone,
  Download,
  Video,
  Plus,
  ChevronRight,
  Folder,
  Sparkles,
} from 'lucide-react';

interface AlbumsViewProps {
  albums: Album[];
  mediaItems: MediaItem[];
  onSelectAlbum: (albumId: string) => void;
  onOpenVault: () => void;
  onOpenTrash: () => void;
  soundEffectsEnabled: boolean;
  isLight: boolean;
}

export const AlbumsView: React.FC<AlbumsViewProps> = ({
  albums,
  mediaItems,
  onSelectAlbum,
  onOpenVault,
  onOpenTrash,
  soundEffectsEnabled,
  isLight,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'system' | 'user'>('all');

  // Calculate counts
  const favoritesCount = mediaItems.filter((i) => i.isFavorite && !i.isInTrash && !i.isHidden).length;
  const vaultCount = mediaItems.filter((i) => i.isHidden && !i.isInTrash).length;
  const trashCount = mediaItems.filter((i) => i.isInTrash).length;
  const cameraCount = mediaItems.filter((i) => i.source === 'camera' && !i.isInTrash && !i.isHidden).length;
  const screenshotsCount = mediaItems.filter((i) => i.source === 'screenshots' && !i.isInTrash && !i.isHidden).length;
  const downloadsCount = mediaItems.filter((i) => i.source === 'downloads' && !i.isInTrash && !i.isHidden).length;

  const favoriteCover = mediaItems.find((i) => i.isFavorite && !i.isInTrash && !i.isHidden)?.url || albums[0]?.coverUrl;
  const cameraCover = mediaItems.find((i) => i.source === 'camera' && !i.isInTrash && !i.isHidden)?.url || albums[1]?.coverUrl;
  const screenshotsCover = mediaItems.find((i) => i.source === 'screenshots' && !i.isInTrash && !i.isHidden)?.url;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-28 space-y-8 animate-in fade-in duration-300">
      {/* Category Pills Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 flex-wrap">
            <span className="whitespace-nowrap">Albums & Folders</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20 whitespace-nowrap">
              {albums.length + 3} Total
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Smart automatic categorization and custom collections
          </p>
        </div>

        <div className={`p-1 rounded-2xl border flex items-center gap-1 self-start sm:self-auto shrink-0 ${
          isLight ? 'bg-slate-200/60 border-slate-300' : 'bg-slate-900 border-slate-800'
        }`}>
          {(['all', 'system', 'user'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                playSoundEffect('click', soundEffectsEnabled);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* System Smart Collections */}
      {(activeCategory === 'all' || activeCategory === 'system') && (
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            System Collections
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Favorites Smart Card */}
            <div
              onClick={() => {
                onSelectAlbum('favorites');
                playSoundEffect('click', soundEffectsEnabled);
              }}
              className={`group relative rounded-3xl p-3 border cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-sm ${
                isLight ? 'bg-white border-slate-200 hover:shadow-lg' : 'bg-slate-900/80 border-slate-800/80 hover:border-purple-500/40'
              }`}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-800 mb-3">
                {favoriteCover ? (
                  <img src={favoriteCover} alt="Favorites" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white">
                    <Heart className="w-10 h-10 fill-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-2.5 left-2.5 p-2 rounded-xl bg-rose-500/90 text-white shadow-md">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
                <span className="absolute bottom-2.5 right-2.5 text-xs font-bold text-white px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md">
                  {favoritesCount}
                </span>
              </div>
              <h4 className="text-sm font-bold truncate">Favorites</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Starred media</p>
            </div>

            {/* Camera Smart Card */}
            <div
              onClick={() => {
                onSelectAlbum('camera');
                playSoundEffect('click', soundEffectsEnabled);
              }}
              className={`group relative rounded-3xl p-3 border cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-sm ${
                isLight ? 'bg-white border-slate-200 hover:shadow-lg' : 'bg-slate-900/80 border-slate-800/80 hover:border-purple-500/40'
              }`}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-800 mb-3">
                {cameraCover ? (
                  <img src={cameraCover} alt="Camera" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white">
                    <Camera className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-2.5 left-2.5 p-2 rounded-xl bg-blue-600/90 text-white shadow-md">
                  <Camera className="w-4 h-4" />
                </div>
                <span className="absolute bottom-2.5 right-2.5 text-xs font-bold text-white px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md">
                  {cameraCount}
                </span>
              </div>
              <h4 className="text-sm font-bold truncate">Camera</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Captured photos</p>
            </div>

            {/* Screenshots Smart Card */}
            <div
              onClick={() => {
                onSelectAlbum('screenshots');
                playSoundEffect('click', soundEffectsEnabled);
              }}
              className={`group relative rounded-3xl p-3 border cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-sm ${
                isLight ? 'bg-white border-slate-200 hover:shadow-lg' : 'bg-slate-900/80 border-slate-800/80 hover:border-purple-500/40'
              }`}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-800 mb-3">
                {screenshotsCover ? (
                  <img src={screenshotsCover} alt="Screenshots" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white">
                    <Smartphone className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-2.5 left-2.5 p-2 rounded-xl bg-indigo-600/90 text-white shadow-md">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="absolute bottom-2.5 right-2.5 text-xs font-bold text-white px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md">
                  {screenshotsCount}
                </span>
              </div>
              <h4 className="text-sm font-bold truncate">Screenshots</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Captured screens</p>
            </div>

            {/* Protected Vault Card */}
            <div
              onClick={() => {
                onOpenVault();
                playSoundEffect('click', soundEffectsEnabled);
              }}
              className={`group relative rounded-3xl p-3 border cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-sm ${
                isLight ? 'bg-white border-slate-200 hover:shadow-lg' : 'bg-slate-900/80 border-slate-800/80 hover:border-indigo-500/40'
              }`}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-tr from-slate-900 via-indigo-950 to-purple-950 flex flex-col items-center justify-center text-indigo-300 mb-3 border border-indigo-500/30">
                <Lock className="w-10 h-10 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] font-bold text-indigo-300 mt-2 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                  PIN SECURED
                </span>
                <span className="absolute bottom-2.5 right-2.5 text-xs font-bold text-white px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md">
                  {vaultCount}
                </span>
              </div>
              <h4 className="text-sm font-bold truncate">Protected Vault</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Hidden & encrypted</p>
            </div>

            {/* Recycle Bin / Trash Card */}
            <div
              onClick={() => {
                onOpenTrash();
                playSoundEffect('click', soundEffectsEnabled);
              }}
              className={`group relative rounded-3xl p-3 border cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-sm ${
                isLight ? 'bg-white border-slate-200 hover:shadow-lg' : 'bg-slate-900/80 border-slate-800/80 hover:border-rose-500/40'
              }`}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-tr from-slate-900 via-rose-950 to-slate-900 flex flex-col items-center justify-center text-rose-400 mb-3 border border-rose-500/30">
                <Trash2 className="w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] font-bold text-rose-300 mt-2 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30">
                  RECYCLE BIN
                </span>
                <span className="absolute bottom-2.5 right-2.5 text-xs font-bold text-white px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md">
                  {trashCount}
                </span>
              </div>
              <h4 className="text-sm font-bold truncate">Recycle Bin</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Recently deleted</p>
            </div>
          </div>
        </section>
      )}

      {/* User Custom Albums */}
      {(activeCategory === 'all' || activeCategory === 'user') && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              User Custom Albums ({albums.length})
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {albums.map((album) => (
              <div
                key={album.id}
                onClick={() => {
                  onSelectAlbum(album.id);
                  playSoundEffect('click', soundEffectsEnabled);
                }}
                className={`group relative rounded-3xl p-3 border cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-sm ${
                  isLight ? 'bg-white border-slate-200 hover:shadow-lg' : 'bg-slate-900/80 border-slate-800/80 hover:border-purple-500/40'
                }`}
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-800 mb-3 shadow-md">
                  <img src={album.coverUrl} alt={album.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute bottom-2.5 right-2.5 text-xs font-bold text-white px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md">
                    {album.itemCount}
                  </span>
                </div>
                <h4 className="text-sm font-bold truncate">{album.name}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{album.category} Album</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

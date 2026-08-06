import React, { useState, useMemo } from 'react';
import { Album, MediaItem } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import { formatMediaUrl } from '../utils/mediaUtils';
import {
  Heart,
  Camera,
  Smartphone,
  Video,
  Plus,
  Clock,
  Search,
  MoreVertical,
  X,
  Folder,
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
  soundEffectsEnabled,
  isLight,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [customUserAlbums, setCustomUserAlbums] = useState<Album[]>([]);

  // Calculate counts & covers for Top 5 primary items
  const recentItems = mediaItems.filter((i) => !i.isInTrash && !i.isHidden);
  const recentCount = recentItems.length;
  const recentCover = recentItems[0]?.thumbnailUrl || recentItems[0]?.url;

  const videoItems = mediaItems.filter((i) => i.type === 'video' && !i.isInTrash && !i.isHidden);
  const videosCount = videoItems.length;
  const videosCover = videoItems[0]?.thumbnailUrl || videoItems[0]?.url;

  const favoriteItems = mediaItems.filter((i) => i.isFavorite && !i.isInTrash && !i.isHidden);
  const favoritesCount = favoriteItems.length;
  const favoritesCover = favoriteItems[0]?.thumbnailUrl || favoriteItems[0]?.url;

  const screenshotItems = mediaItems.filter((i) => i.source === 'screenshots' && !i.isInTrash && !i.isHidden);
  const screenshotsCount = screenshotItems.length;
  const screenshotsCover = screenshotItems[0]?.thumbnailUrl || screenshotItems[0]?.url;

  const cameraItems = mediaItems.filter((i) => i.source === 'camera' && !i.isInTrash && !i.isHidden);
  const cameraCount = cameraItems.length;
  const cameraCover = cameraItems[0]?.thumbnailUrl || cameraItems[0]?.url;

  // Additional "More albums" - strictly dynamic from scanned mediaStore albums & user created albums
  const moreAlbums = useMemo(() => {
    const list = [...albums];

    // Append custom created user albums if not already present
    customUserAlbums.forEach((ca) => {
      if (!list.some((a) => a.id === ca.id)) {
        list.push(ca);
      }
    });

    // Filter out top 5 primary section albums and apply search query
    let filtered = list.filter((a) => {
      const nameLower = a.name.toLowerCase();
      return !['recent', 'videos', 'favorites', 'camera', 'screenshots', 'all'].includes(nameLower);
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((a) => a.name.toLowerCase().includes(q));
    }

    return filtered;
  }, [albums, customUserAlbums, searchQuery]);

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;
    const newAlbum: Album = {
      id: `album_user_${Date.now()}`,
      name: newAlbumName.trim(),
      coverUrl: mediaItems[0]?.url || '',
      itemCount: 0,
      category: 'user',
      createdAt: new Date().toISOString(),
    };
    setCustomUserAlbums((prev) => [...prev, newAlbum]);
    setNewAlbumName('');
    setIsCreateModalOpen(false);
    playSoundEffect('click', soundEffectsEnabled);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-3 pb-28 space-y-6 animate-in fade-in duration-300">
      {/* Search Header Bar matching Native Gallery */}
      <div
        className={`flex items-center justify-between gap-3 p-2.5 rounded-full border shadow-sm transition-all ${
          isLight
            ? 'bg-slate-200/70 border-slate-300 text-slate-800'
            : 'bg-slate-900/80 border-slate-800 text-white'
        }`}
      >
        <div className="flex items-center gap-2.5 flex-1 px-2">
          <Search className={`w-5 h-5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Times, places, file names..."
            className={`w-full bg-transparent text-sm focus:outline-none ${
              isLight ? 'text-slate-900 placeholder-slate-500' : 'text-white placeholder-slate-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`p-1 rounded-full ${
                isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          className={`p-2 rounded-full transition-all ${
            isLight ? 'text-slate-600 hover:bg-slate-300/80' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* TOP SECTION: EXACTLY 5 PRIMARY CARDS */}
      <section className="space-y-3">
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {/* 1. Recent */}
          <div
            onClick={() => {
              onSelectAlbum('all');
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className="group cursor-pointer select-none"
          >
            <div
              className={`relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden border shadow-sm group-hover:scale-[1.03] transition-all duration-300 ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800/80'
              }`}
            >
              {recentCover ? (
                <img src={formatMediaUrl(recentCover)} alt="Recent" className="w-full h-full object-cover" />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center ${
                    isLight
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gradient-to-tr from-purple-900 to-indigo-900 text-purple-300'
                  }`}
                >
                  <Clock className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="mt-1.5 px-0.5">
              <h4 className={`text-xs sm:text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Recent
              </h4>
              <p className={`text-[11px] sm:text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {recentCount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* 2. Videos */}
          <div
            onClick={() => {
              onSelectAlbum('video');
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className="group cursor-pointer select-none"
          >
            <div
              className={`relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden border shadow-sm group-hover:scale-[1.03] transition-all duration-300 ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800/80'
              }`}
            >
              {videosCover ? (
                <img src={formatMediaUrl(videosCover)} alt="Videos" className="w-full h-full object-cover" />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center ${
                    isLight
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gradient-to-tr from-indigo-900 to-blue-900 text-indigo-300'
                  }`}
                >
                  <Video className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="mt-1.5 px-0.5">
              <h4 className={`text-xs sm:text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Videos
              </h4>
              <p className={`text-[11px] sm:text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {videosCount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* 3. Favorites */}
          <div
            onClick={() => {
              onSelectAlbum('favorites');
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className="group cursor-pointer select-none"
          >
            <div
              className={`relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden border shadow-sm group-hover:scale-[1.03] transition-all duration-300 ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800/80'
              }`}
            >
              {favoritesCover ? (
                <img src={formatMediaUrl(favoritesCover)} alt="Favorites" className="w-full h-full object-cover" />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center ${
                    isLight
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-gradient-to-tr from-rose-900 to-pink-900 text-rose-300'
                  }`}
                >
                  <Heart className="w-8 h-8 fill-rose-300/30" />
                </div>
              )}
            </div>
            <div className="mt-1.5 px-0.5">
              <h4 className={`text-xs sm:text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Favorites
              </h4>
              <p className={`text-[11px] sm:text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {favoritesCount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* 4. Screenshots */}
          <div
            onClick={() => {
              onSelectAlbum('screenshots');
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className="group cursor-pointer select-none"
          >
            <div
              className={`relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden border shadow-sm group-hover:scale-[1.03] transition-all duration-300 ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800/80'
              }`}
            >
              {screenshotsCover ? (
                <img src={formatMediaUrl(screenshotsCover)} alt="Screenshots" className="w-full h-full object-cover" />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center ${
                    isLight
                      ? 'bg-fuchsia-100 text-fuchsia-600'
                      : 'bg-gradient-to-tr from-purple-900 to-fuchsia-900 text-purple-300'
                  }`}
                >
                  <Smartphone className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="mt-1.5 px-0.5">
              <h4 className={`text-xs sm:text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Screenshots
              </h4>
              <p className={`text-[11px] sm:text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {screenshotsCount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* 5. Camera */}
          <div
            onClick={() => {
              onSelectAlbum('camera');
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className="group cursor-pointer select-none"
          >
            <div
              className={`relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden border shadow-sm group-hover:scale-[1.03] transition-all duration-300 ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800/80'
              }`}
            >
              {cameraCover ? (
                <img src={formatMediaUrl(cameraCover)} alt="Camera" className="w-full h-full object-cover" />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center ${
                    isLight
                      ? 'bg-cyan-100 text-cyan-600'
                      : 'bg-gradient-to-tr from-cyan-900 to-blue-900 text-cyan-300'
                  }`}
                >
                  <Camera className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="mt-1.5 px-0.5">
              <h4 className={`text-xs sm:text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Camera
              </h4>
              <p className={`text-[11px] sm:text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {cameraCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LOWER SECTION: MORE ALBUMS (User Folders & Dynamic Additions) */}
      <section className="space-y-3 pt-4">
        <h3 className={`text-base sm:text-lg font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
          More albums
        </h3>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {moreAlbums.map((album) => (
            <div
              key={album.id}
              onClick={() => {
                onSelectAlbum(album.id);
                playSoundEffect('click', soundEffectsEnabled);
              }}
              className="group cursor-pointer select-none"
            >
              <div
                className={`relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden border shadow-sm group-hover:scale-[1.03] transition-all duration-300 ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800/80'
                }`}
              >
                {album.coverUrl ? (
                  <img src={formatMediaUrl(album.coverUrl)} alt={album.name} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${
                      isLight
                        ? 'bg-slate-200/80 text-slate-500'
                        : 'bg-gradient-to-tr from-slate-800 to-slate-900 text-slate-400'
                    }`}
                  >
                    <Folder className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="mt-1.5 px-0.5">
                <h4 className={`text-xs sm:text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {album.name}
                </h4>
                <p className={`text-[11px] sm:text-xs font-medium truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {album.description || album.itemCount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}

          {/* Plus (+) Create Album Card */}
          <div
            onClick={() => {
              setIsCreateModalOpen(true);
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className="group cursor-pointer select-none"
          >
            <div
              className={`relative aspect-square w-full rounded-2xl sm:rounded-3xl border-2 border-dashed flex items-center justify-center group-hover:scale-[1.03] transition-all duration-300 shadow-sm ${
                isLight
                  ? 'bg-teal-50 border-teal-300 hover:border-teal-500'
                  : 'bg-teal-500/10 border-teal-500/40 hover:border-teal-400'
              }`}
            >
              <div className="p-3 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all">
                <Plus className="w-7 h-7" />
              </div>
            </div>
            <div className="mt-1.5 px-0.5">
              <h4 className={`text-xs sm:text-sm font-bold truncate ${isLight ? 'text-teal-700' : 'text-teal-400'}`}>
                Create Album
              </h4>
              <p className={`text-[11px] sm:text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Add new folder
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal to Create New Album */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Folder className="w-5 h-5 text-teal-500" />
                New Album
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className={`p-1 rounded-full ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Album Name
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  placeholder="e.g. Travel 2026, Family"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-teal-500 ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                    isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newAlbumName.trim()}
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-white dark:text-slate-950 font-bold text-xs shadow-lg disabled:opacity-50 transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

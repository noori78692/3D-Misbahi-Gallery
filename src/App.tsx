import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { MediaItem, Album, ViewMode, AppSettings, MainTab } from './types';
import { mediaStoreService, MediaStoreService } from './services/mediaStoreService';
import { toggleAmbientBackgroundMusic, stopAmbientBackgroundMusic } from './utils/audioSynth';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Gallery2D } from './components/Gallery2D';
import { Gallery3D } from './components/Gallery3D';
import { AlbumsView } from './components/AlbumsView';
import { AudioView } from './components/AudioView';
import { MediaLightbox } from './components/MediaLightbox';
import { PhotoEditor } from './components/PhotoEditor';
import { SecureVaultModal } from './components/SecureVaultModal';
import { StorageAnalyzerModal } from './components/StorageAnalyzerModal';
import { AiOrganizeModal } from './components/AiOrganizeModal';
import { UploadModal } from './components/UploadModal';
import { SettingsModal } from './components/SettingsModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { AudioPlayerModal } from './components/AudioPlayerModal';
import { MiniAudioPlayer } from './components/MiniAudioPlayer';
import { X, Sparkles } from 'lucide-react';

const DEFAULT_APP_SETTINGS: AppSettings = {
  themeMode: 'dark',
  theme: 'cyber_violet',
  isDarkMode: true,
  builtInVideoPlayerEnabled: true,
  builtInAudioPlayerEnabled: true,
  audioEffectsEnabled: true,
  soundEffectsEnabled: true,
  backgroundMusicEnabled: true,
  hardwareAcceleration: true,
  autoResumeMedia: true,
  gridColumns: 3,
  slideshowSpeed: 3,
  slideshowEffect: 'fade',
  pinCode: '',
  securityQuestion: 'What is the name of this gallery?',
  securityAnswer: '',
};

const loadInitialSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem('misbahi_gallery_settings_v3');
    if (saved) return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(saved) };
  } catch (e) {
    console.error('Failed loading settings', e);
  }
  return DEFAULT_APP_SETTINGS;
};

export default function App() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [settings, setSettings] = useState<AppSettings>(loadInitialSettings);

  const [activeTab, setActiveTab] = useState<MainTab>('photos');
  const [is3DExperienceOpen, setIs3DExperienceOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Modal & Active View States
  const [activeLightboxItem, setActiveLightboxItem] = useState<MediaItem | null>(null);
  const [activeEditorItem, setActiveEditorItem] = useState<MediaItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isStorageAnalyzerOpen, setIsStorageAnalyzerOpen] = useState(false);
  const [isAiOrganizeOpen, setIsAiOrganizeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Dedicated Video & Audio Players State
  const [activeVideoItem, setActiveVideoItem] = useState<MediaItem | null>(null);
  const [activeAudioItem, setActiveAudioItem] = useState<MediaItem | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [showFullAudioModal, setShowFullAudioModal] = useState(false);

  const audioEngineRef = useRef<HTMLAudioElement | null>(null);

  // Initialize global audio engine element
  useEffect(() => {
    const audioEl = new Audio();
    audioEngineRef.current = audioEl;

    const handleTimeUpdate = () => {
      setAudioCurrentTime(audioEl.currentTime);
      setAudioDuration(audioEl.duration || 0);
    };

    const handleEnded = () => {
      setIsAudioPlaying(false);
    };

    audioEl.addEventListener('timeupdate', handleTimeUpdate);
    audioEl.addEventListener('ended', handleEnded);

    return () => {
      audioEl.pause();
      audioEl.removeEventListener('timeupdate', handleTimeUpdate);
      audioEl.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Sync Audio Item change to audio element
  useEffect(() => {
    if (activeAudioItem && audioEngineRef.current) {
      audioEngineRef.current.src = activeAudioItem.url;
      audioEngineRef.current.play().then(() => setIsAudioPlaying(true)).catch(console.error);
    }
  }, [activeAudioItem]);

  // Audio Play / Pause handler
  const handleToggleAudioPlay = () => {
    if (audioEngineRef.current) {
      if (isAudioPlaying) {
        audioEngineRef.current.pause();
        setIsAudioPlaying(false);
      } else {
        audioEngineRef.current.play().then(() => setIsAudioPlaying(true)).catch(console.error);
      }
    }
  };

  const handleAudioSeek = (secs: number) => {
    if (audioEngineRef.current) {
      audioEngineRef.current.currentTime = secs;
      setAudioCurrentTime(secs);
    }
  };

  // Background Music Effect for 3D Experience
  useEffect(() => {
    if (is3DExperienceOpen && settings.backgroundMusicEnabled) {
      toggleAmbientBackgroundMusic(true);
    } else {
      stopAmbientBackgroundMusic();
    }
    return () => stopAmbientBackgroundMusic();
  }, [is3DExperienceOpen, settings.backgroundMusicEnabled]);

  // Initial Android MediaStore device scan & real-time observer
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const autoScanMediaStore = async () => {
      try {
        const items = await MediaStoreService.getInstance().getMedia();
        const albumList = await MediaStoreService.getInstance().getAlbums();
        if (items.length > 0) {
          setMediaItems(items);
        }
        if (albumList.length > 0) {
          setAlbums(albumList);
        }

        // Set up real-time listener for file changes (camera photos, downloads, etc.)
        unsubscribe = await mediaStoreService.listenForMediaStoreChanges((updated) => {
          if (updated.items.length > 0) {
            setMediaItems(updated.items);
          }
          if (updated.albums.length > 0) {
            setAlbums(updated.albums);
          }
        });
      } catch (e) {
        console.error('MediaStore auto-scan error', e);
      }
    };

    autoScanMediaStore();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('misbahi_gallery_settings_v3', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed saving settings', e);
    }
  }, [settings]);

  // Item Opening Handler
  const handleSelectMedia = (item: MediaItem) => {
    if (item.type === 'video' && settings.builtInVideoPlayerEnabled) {
      setActiveVideoItem(item);
      return;
    }
    if (item.type === 'audio' && settings.builtInAudioPlayerEnabled) {
      setActiveAudioItem(item);
      setShowFullAudioModal(true);
      return;
    }
    setActiveLightboxItem(item);
  };

  // Filter Media Items logic
  const filteredItems = mediaItems.filter((item) => {
    if (item.isInTrash) return false;
    if (item.isHidden) return false;

    // Tab based filtering
    if (activeTab === 'photos' && item.type !== 'photo') return false;
    if (activeTab === 'videos' && item.type !== 'video') return false;

    // Rule: If Music & Audio player is OFF, completely hide audio files
    if (!settings.builtInAudioPlayerEnabled && item.type === 'audio') {
      return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
      const matchMonth = item.month.toLowerCase().includes(q);
      const matchPerson = item.personName?.toLowerCase().includes(q);
      const matchLocation = item.location?.name.toLowerCase().includes(q) || item.location?.city.toLowerCase().includes(q);
      if (!matchTitle && !matchTags && !matchMonth && !matchPerson && !matchLocation) {
        return false;
      }
    }

    // Category filter
    if (activeCategory === 'photo') return item.type === 'photo';
    if (activeCategory === 'video') return item.type === 'video';
    if (activeCategory === 'audio') return item.type === 'audio';
    if (activeCategory === 'document') return item.type === 'document';
    if (activeCategory === 'camera') return item.source === 'camera';
    if (activeCategory === 'whatsapp') return item.source === 'whatsapp';
    if (activeCategory === 'telegram') return item.source === 'telegram';
    if (activeCategory === 'screenshots') return item.source === 'screenshots';
    if (activeCategory === 'favorites') return item.isFavorite;

    // Person filter prefix
    if (activeCategory.startsWith('person:')) {
      const pName = activeCategory.replace('person:', '');
      return item.personName === pName;
    }

    // Location filter prefix
    if (activeCategory.startsWith('place:')) {
      const locName = activeCategory.replace('place:', '');
      return item.location?.city === locName || item.location?.name.includes(locName);
    }

    return true;
  });

  // Items in trash
  const trashItems = mediaItems.filter((i) => i.isInTrash);
  // Items in hidden vault
  const hiddenItems = mediaItems.filter((i) => i.isHidden);

  // Multi-select actions
  const handleToggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    setSelectedItemIds(filteredItems.map((i) => i.id));
  };

  const handleClearSelection = () => {
    setSelectedItemIds([]);
  };

  const handleScanComplete = (newItems: MediaItem[]) => {
    setMediaItems((prev) => [...newItems, ...prev]);
  };

  const handleBatchDelete = () => {
    setMediaItems((prev) =>
      prev.map((i) => (selectedItemIds.includes(i.id) ? { ...i, isInTrash: true, trashedAt: new Date().toISOString() } : i))
    );
    setSelectedItemIds([]);
  };

  const handleBatchFavorite = () => {
    setMediaItems((prev) => prev.map((i) => (selectedItemIds.includes(i.id) ? { ...i, isFavorite: !i.isFavorite } : i)));
    setSelectedItemIds([]);
  };

  const handleBatchHideVault = () => {
    setMediaItems((prev) => prev.map((i) => (selectedItemIds.includes(i.id) ? { ...i, isHidden: true } : i)));
    setSelectedItemIds([]);
  };

  const handleSingleFavorite = (id: string) => {
    setMediaItems((prev) => prev.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i)));
  };

  const handleSingleDeleteToTrash = (id: string) => {
    setMediaItems((prev) => prev.map((i) => (i.id === id ? { ...i, isInTrash: true } : i)));
  };

  const handleSingleMoveToVault = (id: string) => {
    setMediaItems((prev) => prev.map((i) => (i.id === id ? { ...i, isHidden: true } : i)));
  };

  const handleUnhideVaultItem = (id: string) => {
    setMediaItems((prev) => prev.map((i) => (i.id === id ? { ...i, isHidden: false } : i)));
  };

  const handleEmptyTrash = () => {
    setMediaItems((prev) => prev.filter((i) => !i.isInTrash));
  };

  const handleDeleteDuplicates = (dupIds: string[]) => {
    setMediaItems((prev) => prev.filter((i) => !dupIds.includes(i.id)));
  };

  const handleAddMediaItem = (newItem: MediaItem) => {
    setMediaItems((prev) => [newItem, ...prev]);
  };

  const handleSaveEditedPhoto = (editedItem: MediaItem) => {
    setMediaItems((prev) => [editedItem, ...prev]);
  };

  const isLight = settings.themeMode === 'light';
  const isAmoled = settings.themeMode === 'amoled';

  const activeTabTitles: Record<MainTab, string> = {
    photos: 'Photos',
    videos: 'Videos',
    albums: 'Albums & Folders',
    audio: 'Music & Audio',
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-purple-500 selection:text-white transition-colors duration-300 ${
      isLight
        ? 'bg-slate-100 text-slate-900'
        : isAmoled
        ? 'bg-black text-slate-100'
        : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Header */}
      <Header
        activeTabTitle={activeTabTitles[activeTab]}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpen3DExperience={() => setIs3DExperienceOpen(true)}
        settings={settings}
        onUpdateSettings={setSettings}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenStorageAnalyzer={() => setIsStorageAnalyzerOpen(true)}
        onOpenAiOrganize={() => setIsAiOrganizeOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Tab Area */}
      <main className="max-w-7xl mx-auto p-4 flex flex-col gap-4">
        {activeTab === 'photos' && (
          <Gallery2D
            items={filteredItems}
            selectedItemIds={selectedItemIds}
            onToggleSelectItem={handleToggleSelectItem}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onSelectMedia={handleSelectMedia}
            onBatchDelete={handleBatchDelete}
            onBatchFavorite={handleBatchFavorite}
            onBatchHideVault={handleBatchHideVault}
            gridColumns={settings.gridColumns}
            onChangeGridColumns={(cols) => setSettings((s) => ({ ...s, gridColumns: cols }))}
            soundEffectsEnabled={settings.soundEffectsEnabled}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            onScanComplete={handleScanComplete}
          />
        )}

        {activeTab === 'videos' && (
          <Gallery2D
            items={filteredItems}
            selectedItemIds={selectedItemIds}
            onToggleSelectItem={handleToggleSelectItem}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onSelectMedia={handleSelectMedia}
            onBatchDelete={handleBatchDelete}
            onBatchFavorite={handleBatchFavorite}
            onBatchHideVault={handleBatchHideVault}
            gridColumns={settings.gridColumns}
            onChangeGridColumns={(cols) => setSettings((s) => ({ ...s, gridColumns: cols }))}
            soundEffectsEnabled={settings.soundEffectsEnabled}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            onScanComplete={handleScanComplete}
          />
        )}

        {activeTab === 'albums' && (
          <AlbumsView
            albums={albums}
            mediaItems={mediaItems}
            onSelectAlbum={(albumId) => {
              setActiveCategory(albumId);
              setActiveTab('photos');
            }}
            onOpenVault={() => setIsVaultOpen(true)}
            onOpenTrash={() => setIsStorageAnalyzerOpen(true)}
            soundEffectsEnabled={settings.soundEffectsEnabled}
            isLight={isLight}
          />
        )}

        {activeTab === 'audio' && settings.builtInAudioPlayerEnabled && (
          <AudioView
            mediaItems={mediaItems}
            activeAudioItem={activeAudioItem}
            isPlaying={isAudioPlaying}
            onSelectTrack={(track) => {
              setActiveAudioItem(track);
              setShowFullAudioModal(true);
            }}
            onTogglePlay={handleToggleAudioPlay}
            soundEffectsEnabled={settings.soundEffectsEnabled}
            isLight={isLight}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpen3DExperience={() => setIs3DExperienceOpen(true)}
        soundEffectsEnabled={settings.soundEffectsEnabled}
        isLight={isLight}
        hasAudioTab={settings.builtInAudioPlayerEnabled}
      />

      {/* Full Screen Immersive 3D Experience Overlay */}
      {is3DExperienceOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in duration-300">
          <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              <h2 className="text-sm font-extrabold">Spatial 3D Gallery</h2>
            </div>
            <button
              onClick={() => setIs3DExperienceOpen(false)}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-950/80 transition-all"
            >
              <X className="w-4 h-4" />
              Exit 3D Mode
            </button>
          </div>

          <Gallery3D
            items={mediaItems.filter((i) => !i.isInTrash && !i.isHidden)}
            albums={albums}
            onSelectMedia={handleSelectMedia}
            onSelectAlbum={() => setIs3DExperienceOpen(false)}
            soundEffectsEnabled={settings.soundEffectsEnabled}
            backgroundMusicEnabled={settings.backgroundMusicEnabled}
            onToggleBGM={() =>
              setSettings((s) => ({ ...s, backgroundMusicEnabled: !s.backgroundMusicEnabled }))
            }
            themeMode={settings.themeMode}
          />
        </div>
      )}

      {/* Persistent Mini Audio Player Bar */}
      {activeAudioItem && settings.builtInAudioPlayerEnabled && (
        <MiniAudioPlayer
          activeTrack={activeAudioItem}
          isPlaying={isAudioPlaying}
          currentTime={audioCurrentTime}
          duration={audioDuration}
          onTogglePlay={handleToggleAudioPlay}
          onNextTrack={() => {
            const audioTracks = mediaItems.filter((i) => i.type === 'audio');
            const idx = audioTracks.findIndex((i) => i.id === activeAudioItem.id);
            if (idx >= 0 && idx < audioTracks.length - 1) {
              setActiveAudioItem(audioTracks[idx + 1]);
            }
          }}
          onPrevTrack={() => {
            const audioTracks = mediaItems.filter((i) => i.type === 'audio');
            const idx = audioTracks.findIndex((i) => i.id === activeAudioItem.id);
            if (idx > 0) {
              setActiveAudioItem(audioTracks[idx - 1]);
            }
          }}
          onOpenFullPlayer={() => setShowFullAudioModal(true)}
          onClosePlayer={() => {
            if (audioEngineRef.current) audioEngineRef.current.pause();
            setIsAudioPlaying(false);
            setActiveAudioItem(null);
          }}
          soundEffectsEnabled={settings.soundEffectsEnabled}
        />
      )}

      {/* Built-in Video Player Modal */}
      {activeVideoItem && (
        <VideoPlayerModal
          item={activeVideoItem}
          playlist={filteredItems}
          onClose={() => setActiveVideoItem(null)}
          onNavigate={(newItem) => setActiveVideoItem(newItem)}
          soundEffectsEnabled={settings.soundEffectsEnabled}
          hardwareAcceleration={settings.hardwareAcceleration}
          autoResumeMedia={settings.autoResumeMedia}
        />
      )}

      {/* Built-in Full-Screen Music & Audio Player Modal */}
      {activeAudioItem && showFullAudioModal && (
        <AudioPlayerModal
          activeTrack={activeAudioItem}
          playlist={mediaItems}
          isPlaying={isAudioPlaying}
          currentTime={audioCurrentTime}
          duration={audioDuration}
          onTogglePlay={handleToggleAudioPlay}
          onSeek={handleAudioSeek}
          onNavigate={(newItem) => setActiveAudioItem(newItem)}
          onClose={() => setShowFullAudioModal(false)}
          soundEffectsEnabled={settings.soundEffectsEnabled}
          audioEffectsEnabled={settings.audioEffectsEnabled}
        />
      )}

      {/* Dedicated Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setIsSettingsOpen(false)}
          soundEffectsEnabled={settings.soundEffectsEnabled}
        />
      )}

      {/* Standard Lightbox Modal */}
      {activeLightboxItem && (
        <MediaLightbox
          item={activeLightboxItem}
          items={filteredItems}
          onClose={() => setActiveLightboxItem(null)}
          onNavigate={(newItem) => setActiveLightboxItem(newItem)}
          onToggleFavorite={handleSingleFavorite}
          onDeleteToTrash={handleSingleDeleteToTrash}
          onMoveToVault={handleSingleMoveToVault}
          onOpenEditor={(item) => {
            setActiveLightboxItem(null);
            setActiveEditorItem(item);
          }}
          soundEffectsEnabled={settings.soundEffectsEnabled}
          slideshowSpeed={settings.slideshowSpeed}
        />
      )}

      {/* Photo Studio Editor Modal */}
      {activeEditorItem && (
        <PhotoEditor
          item={activeEditorItem}
          onSave={handleSaveEditedPhoto}
          onClose={() => setActiveEditorItem(null)}
          soundEffectsEnabled={settings.soundEffectsEnabled}
        />
      )}

      {/* Secure Vault Modal */}
      {isVaultOpen && (
        <SecureVaultModal
          hiddenItems={hiddenItems}
          settings={settings}
          onUpdateSettings={setSettings}
          onUnhideItem={handleUnhideVaultItem}
          onClose={() => setIsVaultOpen(false)}
          onSelectMedia={handleSelectMedia}
          soundEffectsEnabled={settings.soundEffectsEnabled}
        />
      )}

      {/* Storage & Optimizer Modal */}
      {isStorageAnalyzerOpen && (
        <StorageAnalyzerModal
          items={mediaItems.filter((i) => !i.isInTrash && !i.isHidden)}
          trashItems={trashItems}
          onDeleteDuplicates={handleDeleteDuplicates}
          onEmptyTrash={handleEmptyTrash}
          onDeleteLargeFile={handleSingleDeleteToTrash}
          onClose={() => setIsStorageAnalyzerOpen(false)}
          soundEffectsEnabled={settings.soundEffectsEnabled}
        />
      )}

      {/* AI Auto-Organize Modal */}
      {isAiOrganizeOpen && (
        <AiOrganizeModal
          items={mediaItems}
          onSelectPersonFilter={(personName) => {
            setActiveCategory(`person:${personName}`);
            setActiveTab('photos');
          }}
          onSelectLocationFilter={(locName) => {
            setActiveCategory(`place:${locName}`);
            setActiveTab('photos');
          }}
          onClose={() => setIsAiOrganizeOpen(false)}
          soundEffectsEnabled={settings.soundEffectsEnabled}
        />
      )}

      {/* Upload / Import Modal */}
      {isUploadOpen && (
        <UploadModal
          onAddMediaItem={handleAddMediaItem}
          onClose={() => setIsUploadOpen(false)}
          soundEffectsEnabled={settings.soundEffectsEnabled}
        />
      )}
    </div>
  );
}

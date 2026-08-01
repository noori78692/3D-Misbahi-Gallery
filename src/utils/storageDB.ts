import { MediaItem, Album, AppSettings } from '../types';

const MEDIA_STORAGE_KEY = 'misbahi_gallery_media_v2';
const ALBUMS_STORAGE_KEY = 'misbahi_gallery_albums_v2';
const SETTINGS_STORAGE_KEY = 'misbahi_gallery_settings_v3';
const POSITIONS_STORAGE_KEY = 'misbahi_media_positions_v1';

export const DEFAULT_SETTINGS: AppSettings = {
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
  pinCode: '', // No demo PIN - user configures their custom PIN
  securityQuestion: "What is the name of this gallery?",
  securityAnswer: '',
};

export function loadSettingsFromStorage(): AppSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettingsToStorage(settings: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function loadMediaPositions(): Record<string, number> {
  try {
    const saved = localStorage.getItem(POSITIONS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

export function getSavedMediaPosition(id: string): number {
  const positions = loadMediaPositions();
  return positions[id] || 0;
}

export function saveMediaPosition(id: string, seconds: number) {
  try {
    const positions = loadMediaPositions();
    positions[id] = seconds;
    localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(positions));
  } catch (e) {}
}

export function loadMediaFromStorage(): MediaItem[] {
  try {
    const saved = localStorage.getItem(MEDIA_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Filter out legacy dummy sample items
        const cleanItems = parsed.filter((i) => i.id && !i.id.startsWith('m_0'));
        return cleanItems;
      }
    }
  } catch (e) {
    console.error('Failed to load media items', e);
  }
  return [];
}

export function saveMediaToStorage(items: MediaItem[]) {
  try {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save media items', e);
  }
}

export function loadAlbumsFromStorage(): Album[] {
  try {
    const saved = localStorage.getItem(ALBUMS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Filter out legacy dummy sample albums
        const cleanAlbums = parsed.filter((a) => a.id && !a.id.startsWith('album_'));
        return cleanAlbums;
      }
    }
  } catch (e) {
    console.error('Failed to load albums', e);
  }
  return [];
}

export function saveAlbumsToStorage(albums: Album[]) {
  try {
    localStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(albums));
  } catch (e) {
    console.error('Failed to save albums', e);
  }
}

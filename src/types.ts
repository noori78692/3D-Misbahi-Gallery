export type MediaType = 'photo' | 'video' | 'audio' | 'document';

export type MediaSource =
  | 'camera'
  | 'whatsapp'
  | 'telegram'
  | 'screenshots'
  | 'downloads'
  | 'screen_recording'
  | 'sdcard'
  | 'bluetooth'
  | 'movies'
  | 'music'
  | 'documents'
  | 'general';

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  source: MediaSource;
  url: string; // Image URL, video URL, or audio URL
  thumbnailUrl?: string;
  sizeBytes: number;
  dateAdded: string; // ISO string
  dateTaken: string; // ISO string
  year: number;
  month: string; // e.g., "July 2026"
  width?: number;
  height?: number;
  duration?: number; // In seconds for video/audio
  albumId?: string;
  albumName?: string;
  tags: string[];
  personName?: string;
  personAvatar?: string;
  location?: {
    name: string;
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  event?: string;
  isFavorite: boolean;
  isHidden: boolean;
  isInTrash: boolean;
  trashedAt?: string;
  exif?: {
    camera?: string;
    aperture?: string;
    iso?: string;
    shutterSpeed?: string;
    focalLength?: string;
  };
  isDuplicate?: boolean;
  duplicateGroup?: string;
  audioWaveform?: number[];
  aiDescription?: string;
  dominantColor?: string;
  artist?: string;
  format?: string;
}

export interface Album {
  id: string;
  name: string;
  coverUrl: string;
  itemCount: number;
  category: 'smart' | 'user' | 'source' | 'person' | 'location';
  description?: string;
  tags?: string[];
  color?: string;
  createdAt: string;
}

export type MainTab = 'photos' | 'videos' | 'albums' | 'audio';

export type ViewMode = '2d' | '3d';

export type View3DStyle = 'floating_cubes' | 'helix_carousel' | 'sphere_cloud' | 'wall_grid' | 'carousel' | 'cube_room' | 'museum_walk' | 'vr_gallery';

export type ThemeMode = 'light' | 'dark' | 'system' | 'amoled';

export type ThemePreset = 'oled_black' | 'cyber_violet' | 'sapphire_blue' | 'emerald_green' | 'sunset_gold';

export interface AppSettings {
  themeMode: ThemeMode;
  theme: ThemePreset;
  isDarkMode: boolean;
  builtInVideoPlayerEnabled: boolean;
  builtInAudioPlayerEnabled: boolean;
  audioEffectsEnabled: boolean;
  soundEffectsEnabled: boolean;
  backgroundMusicEnabled: boolean;
  hardwareAcceleration: boolean;
  autoResumeMedia: boolean;
  gridColumns: number; // 2, 3, 4, 6
  slideshowSpeed: number; // Seconds (2, 3, 5, 10)
  slideshowEffect: 'fade' | 'cube' | 'slide' | 'zoom';
  pinCode?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  language?: string;
  folderViewEnabled?: boolean;
  timelineGrouping?: 'day' | 'month' | 'year';
  thumbnailSize?: 'compact' | 'normal' | 'large';
}

export interface StorageStats {
  totalBytes: number;
  usedBytes: number;
  photosBytes: number;
  videosBytes: number;
  audioBytes: number;
  docsBytes: number;
  trashBytes: number;
  duplicatesBytes: number;
  freeBytes: number;
}


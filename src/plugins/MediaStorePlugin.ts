import { registerPlugin, PluginListenerHandle, Capacitor } from '@capacitor/core';
import { MediaItem, Album } from '../types';

export interface PermissionStatus {
  granted: boolean;
  photos: 'granted' | 'denied' | 'prompt';
  videos: 'granted' | 'denied' | 'prompt';
  audio: 'granted' | 'denied' | 'prompt';
}

export interface MediaStoreQueryOptions {
  limit?: number;
  offset?: number;
  type?: 'photo' | 'video' | 'audio' | 'all';
  bucketId?: string;
  sortBy?: 'date_added' | 'date_taken' | 'display_name';
  sortOrder?: 'asc' | 'desc';
}

export interface MediaStoreScanResult {
  items: MediaItem[];
  albums: Album[];
  totalCount: number;
  hasMore: boolean;
}

export interface MediaStorePluginInterface {
  checkPermissions(): Promise<PermissionStatus>;
  requestPermissions(): Promise<PermissionStatus>;
  scanMediaStore(options?: MediaStoreQueryOptions): Promise<MediaStoreScanResult>;
  getAlbums(): Promise<Album[]>;
  getThumbnail(options: { mediaId: string; width?: number; height?: number }): Promise<{ thumbnailUrl: string }>;
  registerMediaObserver(): Promise<{ listenerId: string }>;
  addListener(eventName: 'mediaStoreChanged', listenerFunc: (data: any) => void): Promise<PluginListenerHandle>;
}

export const MediaStorePlugin = registerPlugin<MediaStorePluginInterface>('MediaStorePlugin', {
  web: () => {
    if (Capacitor.getPlatform() === 'web') {
      return import('./MediaStoreWeb').then((m) => new m.MediaStoreWeb());
    }
    throw new Error('MediaStoreWeb should not be instantiated on Android runtime');
  },
});

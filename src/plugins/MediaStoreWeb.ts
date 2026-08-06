import { WebPlugin, Capacitor } from '@capacitor/core';
import { MediaStorePluginInterface, PermissionStatus, MediaStoreQueryOptions, MediaStoreScanResult } from './MediaStorePlugin';
import { MediaItem, Album } from '../types';
import { loadMediaFromStorage, loadAlbumsFromStorage } from '../utils/storageDB';

export class MediaStoreWeb extends WebPlugin implements MediaStorePluginInterface {
  constructor() {
    super();
    if (Capacitor.getPlatform() === 'android') {
      throw new Error('MediaStoreWeb must never execute on Android');
    }
  }

  private getStorage() {
    return { loadMediaFromStorage, loadAlbumsFromStorage };
  }

  async checkPermissions(): Promise<PermissionStatus> {
    return {
      granted: true,
      photos: 'granted',
      videos: 'granted',
      audio: 'granted',
    };
  }

  async requestPermissions(): Promise<PermissionStatus> {
    return {
      granted: true,
      photos: 'granted',
      videos: 'granted',
      audio: 'granted',
    };
  }

  async scanMediaStore(options?: MediaStoreQueryOptions): Promise<MediaStoreScanResult> {
    const { loadMediaFromStorage, loadAlbumsFromStorage } = this.getStorage();
    const allStored: MediaItem[] = loadMediaFromStorage();
    const storedAlbums: Album[] = loadAlbumsFromStorage();

    let filtered = allStored;
    if (options?.type && options.type !== 'all') {
      filtered = allStored.filter((item) => item.type === options.type);
    }

    if (options?.bucketId) {
      filtered = filtered.filter((item) => item.albumId === options.bucketId);
    }

    const limit = options?.limit || 500;
    const offset = options?.offset || 0;
    const pagedItems = filtered.slice(offset, offset + limit);

    // Build real albums dynamically from media items bucket/folder sources
    const albumMap = new Map<string, Album>();

    // Add stored custom user albums
    storedAlbums.forEach((a) => albumMap.set(a.id, a));

    // Group items by folder/source
    allStored.forEach((item) => {
      const bucketName = item.albumName || (item.source ? item.source.toUpperCase() : 'CAMERA');
      const albumId = `bucket_${bucketName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

      if (!albumMap.has(albumId)) {
        albumMap.set(albumId, {
          id: albumId,
          name: bucketName,
          category: 'source',
          coverUrl: item.thumbnailUrl || item.url,
          itemCount: 1,
          createdAt: item.dateAdded || new Date().toISOString(),
          description: `Folder: ${bucketName}`,
        });
      } else {
        const existing = albumMap.get(albumId)!;
        existing.itemCount += 1;
      }
    });

    return {
      items: pagedItems,
      albums: Array.from(albumMap.values()),
      totalCount: filtered.length,
      hasMore: offset + limit < filtered.length,
    };
  }

  async getAlbums(): Promise<Album[]> {
    const scan = await this.scanMediaStore();
    return scan.albums;
  }

  async getThumbnail(options: { mediaId: string; width?: number; height?: number }): Promise<{ thumbnailUrl: string }> {
    const { loadMediaFromStorage } = this.getStorage();
    const allStored: MediaItem[] = loadMediaFromStorage();
    const item = allStored.find((i) => i.id === options.mediaId);
    return { thumbnailUrl: item?.thumbnailUrl || item?.url || '' };
  }

  async registerMediaObserver(): Promise<{ listenerId: string }> {
    return { listenerId: 'web_media_observer_1' };
  }
}

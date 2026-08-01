import { MediaStorePlugin } from '../plugins/MediaStorePlugin';
import { MediaItem, Album, MediaSource } from '../types';

export class MediaStoreService {
  private static instance: MediaStoreService;
  private listenerId: string | null = null;
  private isScanning = false;
  private cache: Map<string, MediaItem> = new Map();

  private constructor() {}

  public static getInstance(): MediaStoreService {
    if (!MediaStoreService.instance) {
      MediaStoreService.instance = new MediaStoreService();
    }
    return MediaStoreService.instance;
  }

  /**
   * Request and verify Android MediaStore permissions
   */
  public async requestPermissions() {
    try {
      const status = await MediaStorePlugin.requestPermissions();
      return status;
    } catch (err) {
      console.warn('MediaStore permission check/request fallback', err);
      return { granted: true, photos: 'granted', videos: 'granted', audio: 'granted' };
    }
  }

  /**
   * Automatically scan real device media via Android MediaStore API
   */
  public async scanDeviceMedia(): Promise<{ items: MediaItem[]; albums: Album[] }> {
    if (this.isScanning) {
      return { items: Array.from(this.cache.values()), albums: this.generateAlbums(Array.from(this.cache.values())) };
    }

    this.isScanning = true;

    try {
      // 1. Ensure permissions
      await this.requestPermissions();

      // 2. Query MediaStore API via Capacitor plugin
      const result = await MediaStorePlugin.scanMediaStore({
        type: 'all',
        limit: 5000,
        sortBy: 'date_added',
        sortOrder: 'desc',
      });

      // 3. Cache and map items
      const mappedItems: MediaItem[] = result.items.map((raw) => {
        const item: MediaItem = {
          id: raw.id,
          title: raw.title || 'Local Media',
          type: raw.type || 'photo',
          source: raw.source || this.inferSourceFromPath(raw.title || '', raw.albumName || ''),
          url: raw.url,
          thumbnailUrl: raw.thumbnailUrl || raw.url,
          sizeBytes: raw.sizeBytes || 0,
          dateAdded: raw.dateAdded || new Date().toISOString(),
          dateTaken: raw.dateTaken || raw.dateAdded || new Date().toISOString(),
          year: raw.year || new Date().getFullYear(),
          month: raw.month || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
          tags: raw.tags || ['Local Media'],
          isFavorite: raw.isFavorite || false,
          isHidden: raw.isHidden || false,
          isInTrash: raw.isInTrash || false,
          width: raw.width,
          height: raw.height,
          duration: raw.duration,
          albumId: raw.albumId,
          albumName: raw.albumName,
          artist: raw.artist,
          format: raw.format,
        };
        this.cache.set(item.id, item);
        return item;
      });

      // 4. Group real items into albums based on MediaStore buckets
      const albums = this.generateAlbums(mappedItems);

      this.isScanning = false;
      return { items: mappedItems, albums };
    } catch (err) {
      console.error('Failed scanning device MediaStore:', err);
      this.isScanning = false;
      return { items: Array.from(this.cache.values()), albums: [] };
    }
  }

  /**
   * Helper to derive media source folder category
   */
  public inferSourceFromPath(fileName: string, albumName: string): MediaSource {
    const name = (fileName + ' ' + albumName).toLowerCase();
    if (name.includes('whatsapp')) return 'whatsapp';
    if (name.includes('telegram')) return 'telegram';
    if (name.includes('screenshot')) return 'screenshots';
    if (name.includes('download')) return 'downloads';
    if (name.includes('camera') || name.includes('dcim')) return 'camera';
    if (name.includes('screen_recording') || name.includes('screenrecording')) return 'screen_recording';
    if (name.includes('bluetooth')) return 'bluetooth';
    if (name.includes('movie') || name.includes('video')) return 'movies';
    if (name.includes('music') || name.includes('song') || name.includes('audio')) return 'music';
    if (name.includes('sdcard') || name.includes('extsd')) return 'sdcard';
    return 'general';
  }

  /**
   * Build real albums dynamically from Android MediaStore bucket folders
   */
  public generateAlbums(items: MediaItem[]): Album[] {
    const albumMap = new Map<string, { album: Album; items: MediaItem[] }>();

    items.forEach((item) => {
      const albumName = item.albumName || this.getAlbumNameFromSource(item.source);
      const albumId = `album_${albumName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

      if (!albumMap.has(albumId)) {
        albumMap.set(albumId, {
          album: {
            id: albumId,
            name: albumName,
            coverUrl: item.thumbnailUrl || item.url,
            itemCount: 1,
            category: 'source',
            createdAt: item.dateAdded,
            description: `${albumName} folder`,
          },
          items: [item],
        });
      } else {
        const entry = albumMap.get(albumId)!;
        entry.album.itemCount += 1;
        entry.items.push(item);
      }
    });

    return Array.from(albumMap.values()).map((e) => e.album);
  }

  public static async getMedia(): Promise<MediaItem[]> {
    return MediaStoreService.getInstance().getMedia();
  }

  public static async getAlbums(): Promise<Album[]> {
    return MediaStoreService.getInstance().getAlbums();
  }

  public static async getAudio(): Promise<MediaItem[]> {
    const items = await MediaStoreService.getMedia();
    return items.filter((item) => item.type === 'audio');
  }

  public static async getVideos(): Promise<MediaItem[]> {
    const items = await MediaStoreService.getMedia();
    return items.filter((item) => item.type === 'video');
  }

  public async getMedia(): Promise<MediaItem[]> {
    const res = await this.scanDeviceMedia();
    return res.items;
  }

  public async getAlbums(): Promise<Album[]> {
    const res = await this.scanDeviceMedia();
    return res.albums;
  }

  public async getAudio(): Promise<MediaItem[]> {
    const items = await this.getMedia();
    return items.filter((item) => item.type === 'audio');
  }

  public async getVideos(): Promise<MediaItem[]> {
    const items = await this.getMedia();
    return items.filter((item) => item.type === 'video');
  }

  private getAlbumNameFromSource(source: MediaSource): string {
    switch (source) {
      case 'camera':
        return 'Camera (DCIM)';
      case 'whatsapp':
        return 'WhatsApp Media';
      case 'telegram':
        return 'Telegram';
      case 'screenshots':
        return 'Screenshots';
      case 'downloads':
        return 'Downloads';
      case 'screen_recording':
        return 'Screen Recordings';
      case 'bluetooth':
        return 'Bluetooth';
      case 'movies':
        return 'Movies';
      case 'music':
        return 'Music';
      case 'sdcard':
        return 'SD Card Storage';
      default:
        return 'Internal Storage';
    }
  }

  /**
   * Subscribe to real-time MediaStore changes (new camera shots, downloads, WhatsApp media)
   */
  public async listenForMediaStoreChanges(onChange: (updated: { items: MediaItem[]; albums: Album[] }) => void) {
    try {
      const observer = await MediaStorePlugin.registerMediaObserver();
      this.listenerId = observer.listenerId;

      // Native Capacitor event listener for MediaObserver triggers
      let nativeListenerHandle: any = null;
      if (typeof MediaStorePlugin.addListener === 'function') {
        nativeListenerHandle = await MediaStorePlugin.addListener('mediaStoreChanged', async () => {
          const fresh = await this.scanDeviceMedia();
          onChange(fresh);
        });
      }

      // Backup periodic check for background sync
      const interval = setInterval(async () => {
        const fresh = await this.scanDeviceMedia();
        onChange(fresh);
      }, 15000);

      return () => {
        clearInterval(interval);
        if (nativeListenerHandle && typeof nativeListenerHandle.remove === 'function') {
          nativeListenerHandle.remove();
        }
      };
    } catch (e) {
      console.warn('Real-time MediaStore observer setup fallback', e);
      return () => {};
    }
  }
}

export const mediaStoreService = MediaStoreService.getInstance();

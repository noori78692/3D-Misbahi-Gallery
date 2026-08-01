import { MediaItem } from '../types';

export interface ScanFolderProgress {
  scannedCount: number;
  totalCount: number;
  currentFolder: string;
}

export const SUPPORTED_ANDROID_DIRECTORIES = [
  { name: 'Camera', path: '/storage/emulated/0/DCIM/Camera', icon: '📷', key: 'camera' },
  { name: 'Screenshots', path: '/storage/emulated/0/Pictures/Screenshots', icon: '📱', key: 'screenshots' },
  { name: 'Downloads', path: '/storage/emulated/0/Download', icon: '📥', key: 'downloads' },
  { name: 'WhatsApp Media', path: '/storage/emulated/0/Android/media/com.whatsapp', icon: '💬', key: 'whatsapp' },
  { name: 'Telegram Documents', path: '/storage/emulated/0/Telegram', icon: '✈️', key: 'telegram' },
  { name: 'Bluetooth', path: '/storage/emulated/0/Bluetooth', icon: '📶', key: 'bluetooth' },
  { name: 'Screen Recordings', path: '/storage/emulated/0/DCIM/ScreenRecordings', icon: '🎥', key: 'screen_recording' },
  { name: 'Movies & Videos', path: '/storage/emulated/0/Movies', icon: '🎬', key: 'movies' },
  { name: 'Music & Audio', path: '/storage/emulated/0/Music', icon: '🎵', key: 'music' },
  { name: 'Documents', path: '/storage/emulated/0/Documents', icon: '📄', key: 'documents' },
  { name: 'SD Card External Storage', path: '/storage/sdcard1', icon: '💾', key: 'sdcard' },
];

/**
 * Parses raw File objects picked from device storage into full MediaItem records
 */
export async function processFilesFromLocalDevice(
  fileList: FileList | File[],
  defaultFolderKey: string = 'camera'
): Promise<MediaItem[]> {
  const files = Array.from(fileList);
  const mediaItems: MediaItem[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileUrl = URL.createObjectURL(file);
    const dateObj = new Date(file.lastModified || Date.now());
    const dateStr = dateObj.toISOString();
    const year = dateObj.getFullYear();
    const month = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // Determine type
    let type: 'photo' | 'video' | 'audio' | 'document' = 'photo';
    if (file.type.startsWith('video/')) {
      type = 'video';
    } else if (file.type.startsWith('audio/')) {
      type = 'audio';
    } else if (
      file.type.includes('pdf') ||
      file.type.includes('document') ||
      file.type.includes('text') ||
      file.name.endsWith('.pdf') ||
      file.name.endsWith('.doc') ||
      file.name.endsWith('.docx')
    ) {
      type = 'document';
    } else if (file.type.startsWith('image/')) {
      type = 'photo';
    }

    // Determine source directory category from filename or webkitRelativePath
    const pathLower = ((file as any).webkitRelativePath || file.name).toLowerCase();
    let source: MediaItem['source'] = 'camera';

    if (pathLower.includes('whatsapp')) {
      source = 'whatsapp';
    } else if (pathLower.includes('telegram')) {
      source = 'telegram';
    } else if (pathLower.includes('screenshot')) {
      source = 'screenshots';
    } else if (pathLower.includes('download')) {
      source = 'downloads';
    } else if (pathLower.includes('screen') || pathLower.includes('rec')) {
      source = 'screen_recording';
    } else if (pathLower.includes('sdcard') || pathLower.includes('external')) {
      source = 'sdcard';
    } else if (pathLower.includes('bluetooth')) {
      source = 'bluetooth';
    } else {
      source = (defaultFolderKey as any) || 'camera';
    }

    // Clean up title
    const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
    const title = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    // Get width / height / duration metadata asynchronously
    let width = 1920;
    let height = 1080;
    let duration = 0;

    if (type === 'photo') {
      try {
        const dims = await getImageDimensions(fileUrl);
        width = dims.width;
        height = dims.height;
      } catch (e) {}
    } else if (type === 'video') {
      try {
        const mediaMeta = await getVideoMetadata(fileUrl);
        width = mediaMeta.width;
        height = mediaMeta.height;
        duration = Math.round(mediaMeta.duration);
      } catch (e) {}
    } else if (type === 'audio') {
      try {
        duration = Math.round(await getAudioDuration(fileUrl));
      } catch (e) {}
    }

    const item: MediaItem = {
      id: `dev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      title,
      type,
      source,
      url: fileUrl,
      thumbnailUrl: type === 'photo' ? fileUrl : undefined,
      sizeBytes: file.size,
      dateAdded: dateStr,
      dateTaken: dateStr,
      year,
      month,
      width,
      height,
      duration: duration || undefined,
      tags: [type, source, 'local_device'],
      isFavorite: false,
      isHidden: false,
      isInTrash: false,
    };

    mediaItems.push(item);
  }

  return mediaItems;
}

function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || 1920, height: img.naturalHeight || 1080 });
    img.onerror = () => resolve({ width: 1920, height: 1080 });
    img.src = url;
  });
}

function getVideoMetadata(url: string): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth || 1920,
        height: video.videoHeight || 1080,
        duration: video.duration || 0,
      });
    };
    video.onerror = () => resolve({ width: 1920, height: 1080, duration: 0 });
    video.src = url;
  });
}

function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => resolve(audio.duration || 0);
    audio.onerror = () => resolve(0);
    audio.src = url;
  });
}

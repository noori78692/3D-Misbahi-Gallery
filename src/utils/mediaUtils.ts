import { Capacitor } from '@capacitor/core';

/**
 * Converts a raw URL or native Android file path into a webview-compatible image/media URL.
 * Ensures local files starting with /storage or file:// render thumbnails seamlessly in webview.
 */
export function formatMediaUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (
    url.startsWith('blob:') ||
    url.startsWith('data:') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }

  if (Capacitor.isNativePlatform() || Capacitor.getPlatform() === 'android') {
    try {
      return Capacitor.convertFileSrc(url);
    } catch {
      return url;
    }
  }

  return url;
}

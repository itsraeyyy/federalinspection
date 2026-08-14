/**
 * Extracts YouTube video ID from various YouTube URL formats.
 */
export function getYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const match = url.match(regExp);
  if (match && match[1]) {
    return match[1];
  }
  if (url.includes('youtube.com/embed/')) {
    const parts = url.split('youtube.com/embed/');
    const id = parts[1]?.split('?')[0]?.split('/')[0];
    if (id && id.length === 11) return id;
  }
  return null;
}

/**
 * Returns the high quality YouTube thumbnail URL for a given YouTube URL.
 */
export function getYouTubeThumbnail(url?: string | null): string | null {
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return null;
}

/**
 * Returns a standardized YouTube embed URL for iframe rendering.
 */
export function getYouTubeEmbedUrl(url?: string | null): string | null {
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url && url.includes('youtube.com/embed/')) {
    return url;
  }
  return null;
}

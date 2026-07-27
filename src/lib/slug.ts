export function createNewsSlug(id: string, title?: string): string {
  if (!id) return '';
  if (!title) return id;

  const cleanTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^\w\u1200-\u137F]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!cleanTitle) return id;

  const shortId = id.includes('-') ? id.split('-')[0] : id.slice(0, 8);
  return `${cleanTitle}-${shortId}`;
}

export function extractNewsId(slugOrId: string): string {
  if (!slugOrId) return '';
  const decoded = decodeURIComponent(slugOrId).trim();
  
  // Check if full UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decoded);
  if (isUuid) return decoded;

  // Extract trailing short ID if formatted as "title-slug-shortId"
  const parts = decoded.split('-');
  const lastPart = parts[parts.length - 1];
  if (lastPart && /^[0-9a-f]{8}$/i.test(lastPart)) {
    return lastPart;
  }

  return decoded;
}

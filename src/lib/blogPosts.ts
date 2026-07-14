export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  content: string;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function normalizePost(value: unknown): BlogPost | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const doc = value as Record<string, unknown>;
  const id = readString(doc._id) || readString(doc.id);
  if (!id) return null;

  return {
    id,
    title: readString(doc.title),
    summary: readString(doc.summary),
    tags: Array.isArray(doc.tags) ? doc.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    content: readString(doc.content),
    userId: readString(doc.userId),
    userName: readString(doc.userName, 'Anonymous'),
    createdAt: readString(doc.createdAt, new Date().toISOString()),
    updatedAt: readString(doc.updatedAt, new Date().toISOString()),
  };
}

export function parseStoredPosts(raw: string | null): BlogPost[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map(normalizePost).filter((post): post is BlogPost => post !== null)
      : [];
  } catch {
    return [];
  }
}

export type FrontmatterValue = string | number | boolean | string[];

function unquote(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed) as string;
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }
  return trimmed;
}

function parseValue(value: string): FrontmatterValue {
  const trimmed = value.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map(unquote)
      .filter(Boolean);
  }
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return unquote(trimmed);
}

export function parseFrontmatter(rawText: string): {
  data: Record<string, FrontmatterValue>;
  content: string;
} {
  const normalized = rawText.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) return { data: {}, content: rawText };

  const closingFence = normalized.indexOf('\n---\n', 4);
  if (closingFence === -1) return { data: {}, content: rawText };

  const data: Record<string, FrontmatterValue> = {};
  for (const line of normalized.slice(4, closingFence).split('\n')) {
    const separator = line.indexOf(':');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    if (!key) continue;
    data[key] = parseValue(line.slice(separator + 1));
  }

  return { data, content: normalized.slice(closingFence + 5) };
}

export function parseMarkdownFile(fileName: string, rawText: string) {
  const { data, content: parsedContent } = parseFrontmatter(rawText);
  let content = parsedContent;
  let title = data.title ? String(data.title).trim() : '';
  let summary = data.summary || data.description
    ? String(data.summary || data.description).trim()
    : '';
  const rawTags = data.tags || data.keywords;
  let tags: string[] = [];

  if (Array.isArray(rawTags)) {
    tags = rawTags.map((tag) => String(tag).trim());
  } else if (typeof rawTags === 'string') {
    tags = rawTags.split(',').map((tag) => tag.trim());
  }

  if (!title) {
    const heading = content.match(/^(?:#\s+)(.+)$/m);
    if (heading) {
      title = heading[1].trim();
      content = content.replace(/^(?:#\s+)(.+)$/m, '').trim();
    } else {
      title = fileName.replace(/\.[^/.]+$/, '');
    }
  }

  if (!summary) {
    const plainText = content
      .replace(/[#*`_\[\]()\-+]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    summary = `${plainText.slice(0, 120)}${plainText.length > 120 ? '...' : ''}`;
  }

  return { title, summary, tags: tags.filter(Boolean), content };
}

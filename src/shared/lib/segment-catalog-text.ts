export type CatalogLinkEntry = {
  slug: string;
  name: string;
  href: string;
};

export type TextSegment =
  | { type: "text"; value: string }
  | { type: "link"; href: string; label: string };

const WIKI_RE = /\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]/g;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Segmenta texto PHB com wiki-links `[[slug]]` / `[[slug|rótulo]]`
 * e auto-link de nomes do catálogo (maior match primeiro).
 */
export function segmentCatalogText(
  text: string,
  catalog: CatalogLinkEntry[],
  options?: { currentSlug?: string },
): TextSegment[] {
  if (!text) return [];

  const bySlug = new Map(catalog.map((entry) => [entry.slug, entry]));
  const afterWiki = splitWikiLinks(text, bySlug, options?.currentSlug);

  const names = [...catalog]
    .filter((entry) => entry.slug !== options?.currentSlug)
    .sort((a, b) => b.name.length - a.name.length);

  return afterWiki.flatMap((segment) => {
    if (segment.type === "link") return [segment];
    return autoLinkNames(segment.value, names);
  });
}

function splitWikiLinks(
  text: string,
  bySlug: Map<string, CatalogLinkEntry>,
  currentSlug?: string,
): TextSegment[] {
  const segments: TextSegment[] = [];
  let last = 0;
  WIKI_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = WIKI_RE.exec(text))) {
    if (match.index > last) {
      segments.push({ type: "text", value: text.slice(last, match.index) });
    }
    const slug = match[1].trim();
    const label = (match[2] ?? bySlug.get(slug)?.name ?? slug).trim();
    const entry = bySlug.get(slug);
    if (entry && entry.slug !== currentSlug) {
      segments.push({ type: "link", href: entry.href, label });
    } else {
      segments.push({ type: "text", value: label });
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    segments.push({ type: "text", value: text.slice(last) });
  }
  return segments.length ? segments : [{ type: "text", value: text }];
}

function autoLinkNames(text: string, names: CatalogLinkEntry[]): TextSegment[] {
  if (!text || !names.length) return [{ type: "text", value: text }];

  type Hit = { start: number; end: number; entry: CatalogLinkEntry };
  const hits: Hit[] = [];

  for (const entry of names) {
    if (entry.name.length < 3) continue;
    const re = new RegExp(escapeRegExp(entry.name), "gi");
    let match: RegExpExecArray | null;
    while ((match = re.exec(text))) {
      const start = match.index;
      const end = start + match[0].length;
      const overlaps = hits.some((hit) => start < hit.end && end > hit.start);
      if (!overlaps) hits.push({ start, end, entry });
    }
  }

  hits.sort((a, b) => a.start - b.start || b.end - a.end);

  const segments: TextSegment[] = [];
  let cursor = 0;
  for (const hit of hits) {
    if (hit.start < cursor) continue;
    if (hit.start > cursor) {
      segments.push({ type: "text", value: text.slice(cursor, hit.start) });
    }
    segments.push({
      type: "link",
      href: hit.entry.href,
      label: text.slice(hit.start, hit.end),
    });
    cursor = hit.end;
  }
  if (cursor < text.length) {
    segments.push({ type: "text", value: text.slice(cursor) });
  }
  return segments.length ? segments : [{ type: "text", value: text }];
}

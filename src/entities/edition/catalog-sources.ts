import type { Edition } from "@/entities/edition/api";

export const CATALOG_SOURCES_STORAGE_KEY = "grimoire.catalogSources";

export const PHB_EDITION_SLUG = "phb-2024-pt";
export const VALDAS_EDITION_SLUG = "valdas-spire-2024-en";
export const DMG_EDITION_SLUG = "dmg-2024-pt";
export const STEINHARDT_EDITION_SLUG = "steinhardt-eldritch-hunt-2024-en";
export const NORTHLANDS_EDITION_SLUG = "northlands-heroes-2024-en";

const LEGACY_VALDA_EDITION_SLUG = "valda-spire-2024-en";

function normalizeEditionSlug(slug: string): string {
  return slug === LEGACY_VALDA_EDITION_SLUG ? VALDAS_EDITION_SLUG : slug;
}

function isSteinhardtEditionSlug(slug: string): boolean {
  return (
    slug === STEINHARDT_EDITION_SLUG || slug.startsWith("steinhardt-")
  );
}

function isNorthlandsEditionSlug(slug: string): boolean {
  return (
    slug === NORTHLANDS_EDITION_SLUG || slug.startsWith("northlands-")
  );
}

/** Rótulo curto na UI (badge / menu). */
export function editionShortLabel(slug: string | null | undefined): string {
  if (!slug) return "PHB";
  if (slug === PHB_EDITION_SLUG || slug.startsWith("phb-")) return "PHB";
  if (slug.startsWith("valdas-") || slug.startsWith("valda-")) return "Valdas";
  if (slug === DMG_EDITION_SLUG || slug.startsWith("dmg-")) return "DMG";
  if (isSteinhardtEditionSlug(slug)) return "Steinhardt";
  if (isNorthlandsEditionSlug(slug)) return "Northlands";
  return slug;
}

/** Label amigável no seletor de fontes. */
export function editionMenuLabel(edition: Pick<Edition, "slug" | "label" | "book">): string {
  if (edition.slug === PHB_EDITION_SLUG || edition.slug.startsWith("phb-")) {
    return "PHB 2024";
  }
  if (edition.slug.startsWith("valdas-") || edition.slug.startsWith("valda-")) {
    return "Valdas";
  }
  if (edition.slug === DMG_EDITION_SLUG || edition.slug.startsWith("dmg-")) {
    return "DMG 2024";
  }
  if (isSteinhardtEditionSlug(edition.slug)) {
    return "Eldritch Hunt";
  }
  if (isNorthlandsEditionSlug(edition.slug)) {
    return "Northlands";
  }
  return edition.label || edition.book || edition.slug;
}

export function readStoredEnabledEditions(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CATALOG_SOURCES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const slugs = parsed
      .filter((item): item is string => typeof item === "string")
      .map(normalizeEditionSlug);
    return slugs.length > 0 ? slugs : null;
  } catch {
    return null;
  }
}

export function writeStoredEnabledEditions(slugs: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    CATALOG_SOURCES_STORAGE_KEY,
    JSON.stringify(slugs.map(normalizeEditionSlug)),
  );
}

/** Se nem todas as edições estão ativas, devolve CSV para a API; senão undefined. */
export function editionSlugsQueryParam(
  enabled: ReadonlySet<string>,
  available: readonly string[],
): string | undefined {
  if (available.length === 0) return undefined;
  if (available.every((slug) => enabled.has(slug))) return undefined;
  const selected = available.filter((slug) => enabled.has(slug));
  return selected.length > 0 ? selected.join(",") : available[0];
}

export function isEditionAllowed(
  editionSlug: string | null | undefined,
  enabled: ReadonlySet<string>,
): boolean {
  const slug = normalizeEditionSlug(editionSlug?.trim() || PHB_EDITION_SLUG);
  if (enabled.size === 0) return true;
  return enabled.has(slug);
}

export function filterByEnabledEditions<T extends { editionSlug?: string | null }>(
  items: readonly T[],
  enabled: ReadonlySet<string>,
): T[] {
  if (enabled.size === 0) return [...items];
  return items.filter((item) => isEditionAllowed(item.editionSlug, enabled));
}

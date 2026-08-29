import { getDndApiBaseUrl, isDndApiConfigured } from "@/shared/api/dnd-api/env";

const CATALOG_PATH_PREFIX = "/catalog/";

/**
 * Converte `image_url` relativo do catálogo (ex. `/catalog/equipment/club.png`)
 * em URL absoluta servida pela API.
 */
export function resolveCatalogImageUrl(
  url: string | null | undefined,
): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  if (trimmed.startsWith(CATALOG_PATH_PREFIX)) {
    if (!isDndApiConfigured()) return trimmed;
    return `${getDndApiBaseUrl()}${trimmed}`;
  }

  return trimmed;
}

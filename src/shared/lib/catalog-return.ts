/** Paths internos seguros para voltar à listagem do catálogo. */
export function isSafeCatalogReturn(
  value: string | null | undefined,
): value is string {
  if (!value) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  if (value.includes("://")) return false;
  return true;
}

export function appendReturnParam(
  href: string,
  returnTo: string | null | undefined,
) {
  if (!isSafeCatalogReturn(returnTo)) return href;
  const url = new URL(href, "http://local.invalid");
  url.searchParams.set("return", returnTo);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function withCatalogReturn(
  href: string,
  listPath: string | null | undefined,
) {
  return appendReturnParam(href, listPath);
}

export function readReturnParam(
  searchParams: URLSearchParams | { get: (key: string) => string | null },
  fallback: string,
) {
  const value = searchParams.get("return");
  return isSafeCatalogReturn(value) ? value : fallback;
}

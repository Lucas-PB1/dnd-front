/** Rótulo de origem Grim Hollow no criador e na ficha (≠ espécie PHB). */
export function formatHeritageVariantLabel(name: string): string {
  return `${name} (variante)`;
}

export function heritageOriginKindLabel(): string {
  return "Variante";
}

export function isGrimHollowHeritageSlug(slug: string | null | undefined): boolean {
  return Boolean(slug?.startsWith("gh-"));
}

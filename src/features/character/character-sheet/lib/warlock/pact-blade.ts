/**
 * Heurística alinhada à API: ammunition sem thrown ⇒ só à distância.
 */
export function isMeleeWeaponFromPropertySlugs(
  propertySlugs: readonly string[] | null | undefined,
): boolean {
  const ids = propertySlugs ?? [];
  if (ids.includes("ammunition") && !ids.includes("thrown")) {
    return false;
  }
  return true;
}

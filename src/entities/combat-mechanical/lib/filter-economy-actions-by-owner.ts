import type { ClassEconomyActionRecord } from "../types";

export type EconomyActionOwner =
  | { classSlug: string }
  | { subclassSlug: string }
  | { featSlug: string }
  | { itemSlug: string }
  | { speciesSlug: string }
  | { threadSlug: string }
  | { heritageTraitSlugs: readonly string[] };

export function filterEconomyActionsByOwner(
  actions: readonly ClassEconomyActionRecord[],
  owner: EconomyActionOwner,
): ClassEconomyActionRecord[] {
  if ("classSlug" in owner) {
    return actions.filter((action) => action.classSlug === owner.classSlug);
  }
  if ("subclassSlug" in owner) {
    return actions.filter(
      (action) => action.subclassSlug === owner.subclassSlug,
    );
  }
  if ("featSlug" in owner) {
    return actions.filter((action) => action.featSlug === owner.featSlug);
  }
  if ("itemSlug" in owner) {
    return actions.filter((action) => action.itemSlug === owner.itemSlug);
  }
  if ("speciesSlug" in owner) {
    return actions.filter((action) => action.speciesSlug === owner.speciesSlug);
  }
  if ("threadSlug" in owner) {
    return actions.filter((action) => action.threadSlug === owner.threadSlug);
  }
  const traitSlugs = new Set(owner.heritageTraitSlugs);
  return actions.filter(
    (action) =>
      action.heritageTraitSlug != null &&
      traitSlugs.has(action.heritageTraitSlug),
  );
}

export function sortEconomyActionsForCatalog(
  actions: readonly ClassEconomyActionRecord[],
): ClassEconomyActionRecord[] {
  return [...actions].sort((left, right) => {
    if (left.minLevel !== right.minLevel) {
      return left.minLevel - right.minLevel;
    }
    return left.name.localeCompare(right.name, "pt");
  });
}

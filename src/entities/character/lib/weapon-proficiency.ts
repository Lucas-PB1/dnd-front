/**
 * Espelha dnd-api `game/sheet/domain/weapon-attack.ts` → `isProficient`
 * (categorias + grupos; feats/estilos martial-weapon-training e advanced-weapon-proficiency).
 */

const SIMPLE_PROFICIENCY = "armas-simples";
const MARTIAL_PROFICIENCY = "armas-marciais";
const ADVANCED_PROFICIENCY = "armas-avancadas";
const MARTIAL_LIGHT_PROFICIENCY = "armas-marciais-leves";
const MARTIAL_RANGED_PROFICIENCY = "armas-marciais-a-distancia";

/** Proficiências específicas (seeds S027/S031) → item slug. */
const SPECIFIC_WEAPON_PROFICIENCY: Record<string, string> = {
  adagas: "dagger",
  dardos: "dart",
  fundas: "sling",
  bordoes: "quarterstaff",
  "bestas-leves": "light-crossbow",
  "bestas-de-mao": "hand-crossbow",
  "espada-longa": "longsword",
  rapieira: "rapier",
  "espada-curta": "shortsword",
};

export type WeaponProficiencyPiece = {
  itemSlug: string;
  category: string;
  propertySlugs: readonly string[];
};

export type WeaponProficiencyContext = {
  weaponProficiencySlugs: readonly string[];
  featSlugs?: readonly string[];
  fightingStyleSlugs?: readonly string[];
};

function expandProficiencySlugs(
  weaponProficiencySlugs: readonly string[],
  featSlugs: readonly string[],
  fightingStyleSlugs: readonly string[],
): string[] {
  const proficiencySlugs = [...weaponProficiencySlugs];
  const has = (slug: string) =>
    featSlugs.includes(slug) || fightingStyleSlugs.includes(slug);

  if (has("martial-weapon-training")) {
    proficiencySlugs.push(MARTIAL_PROFICIENCY);
  }
  if (has("advanced-weapon-proficiency")) {
    proficiencySlugs.push(ADVANCED_PROFICIENCY);
  }
  return proficiencySlugs;
}

export function isWeaponProficient(
  piece: WeaponProficiencyPiece,
  weaponProficiencySlugs: readonly string[],
  context?: Omit<WeaponProficiencyContext, "weaponProficiencySlugs">,
): boolean {
  const proficiencySlugs = expandProficiencySlugs(
    weaponProficiencySlugs,
    context?.featSlugs ?? [],
    context?.fightingStyleSlugs ?? [],
  );

  for (const slug of proficiencySlugs) {
    const specific = SPECIFIC_WEAPON_PROFICIENCY[slug];
    if (specific && specific === piece.itemSlug) return true;
    if (
      slug === MARTIAL_LIGHT_PROFICIENCY &&
      piece.category === "martial" &&
      piece.propertySlugs.includes("light")
    ) {
      return true;
    }
  }

  if (piece.category === "simple") {
    return weaponProficiencySlugs.includes(SIMPLE_PROFICIENCY);
  }
  if (piece.category === "martial") {
    if (weaponProficiencySlugs.includes(MARTIAL_PROFICIENCY)) return true;
    if (
      weaponProficiencySlugs.includes(MARTIAL_RANGED_PROFICIENCY) &&
      piece.propertySlugs.includes("ammunition")
    ) {
      return true;
    }
  }
  if (piece.category === "advanced") {
    return weaponProficiencySlugs.includes(ADVANCED_PROFICIENCY);
  }
  return false;
}

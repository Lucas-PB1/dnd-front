/**
 * Espelha dnd-api `game/sheet/domain/weapon-attack.ts` → `isProficient`
 * (categorias + grupos; sem feat martial-weapon-training).
 */

const SIMPLE_PROFICIENCY = "armas-simples";
const MARTIAL_PROFICIENCY = "armas-marciais";
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

export function isWeaponProficient(
  piece: WeaponProficiencyPiece,
  weaponProficiencySlugs: readonly string[],
): boolean {
  for (const slug of weaponProficiencySlugs) {
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
  return false;
}

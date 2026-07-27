/**
 * Espelha dnd-api `game/sheet/domain/class-weapon-mastery-slots.ts`.
 * Cotas vêm de GET /classes/:slug/progression (`weaponMastery`).
 */

export type ClassWeaponMasterySlot = {
  optionKey: string;
  unlockLevel: number;
};

export type WeaponMasteryEligibility = "any" | "melee";

export type ClassProgressionMasteryRow = {
  level: number;
  weaponMastery: number | null;
};

export const WEAPON_MASTER_FEAT_OPTION_KEY = "masteryWeapon";

export function classWeaponMasterySlotsFromProgression(
  rows: readonly ClassProgressionMasteryRow[],
): ClassWeaponMasterySlot[] {
  const sorted = [...rows].sort((a, b) => a.level - b.level);
  const slots: ClassWeaponMasterySlot[] = [];
  let previousCount = 0;

  for (const row of sorted) {
    const count = row.weaponMastery ?? 0;
    if (count <= previousCount) continue;
    for (let index = previousCount + 1; index <= count; index += 1) {
      slots.push({
        optionKey: `masteryWeapon${index}`,
        unlockLevel: row.level,
      });
    }
    previousCount = count;
  }

  return slots;
}

export function classWeaponMasterySlotsAtLevel(
  rows: readonly ClassProgressionMasteryRow[],
  level: number,
): ClassWeaponMasterySlot[] {
  return classWeaponMasterySlotsFromProgression(rows).filter(
    (slot) => slot.unlockLevel <= level,
  );
}

export function classWeaponMasterySlotsNewAtLevel(
  rows: readonly ClassProgressionMasteryRow[],
  level: number,
): ClassWeaponMasterySlot[] {
  return classWeaponMasterySlotsFromProgression(rows).filter(
    (slot) => slot.unlockLevel === level,
  );
}

export function isClassWeaponMasteryOptionKey(optionKey: string): boolean {
  return /^masteryWeapon\d+$/.test(optionKey);
}

export function parseWeaponMasteryEligibility(
  value: string | null | undefined,
): WeaponMasteryEligibility | null {
  if (value === "any" || value === "melee") return value;
  return null;
}

type ClassOptionLike = { optionKey: string; valueId: string };
type FeatOptionLike = { optionKey: string; valueId: string };

export function collectMasteredWeaponSlugs(input: {
  classOptions?: readonly ClassOptionLike[];
  featOptions?: readonly FeatOptionLike[];
}): string[] {
  const fromClass = (input.classOptions ?? [])
    .filter(
      (option) =>
        isClassWeaponMasteryOptionKey(option.optionKey) && option.valueId,
    )
    .map((option) => option.valueId);
  const fromFeat = (input.featOptions ?? [])
    .filter(
      (option) =>
        option.optionKey === WEAPON_MASTER_FEAT_OPTION_KEY && option.valueId,
    )
    .map((option) => option.valueId);
  return [...new Set([...fromClass, ...fromFeat])];
}

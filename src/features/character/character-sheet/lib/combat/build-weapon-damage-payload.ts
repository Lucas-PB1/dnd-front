import type { RollDamagePayload } from "@/features/character/character-sheet/api/character-rolls.api";

export type WeaponDamageOptions = {
  itemSlug: string;
  mode: "melee" | "ranged";
  critical?: boolean;
  sightedReroll?: boolean;
  sneakAttack?: boolean;
  cunningStrikeEffects?: string[];
  poisonousSneak?: boolean;
  assassinSurprise?: boolean;
  assassinDeathStrike?: boolean;
  assassinPoisonFailedSave?: boolean;
  huntersMark?: boolean;
  colossusSlayer?: boolean;
  dreadfulStrikes?: boolean;
  divineSmite?: boolean;
  smiteSlotLevel?: number;
  smiteVsUndeadOrFiend?: boolean;
  dreadAmbusher?: boolean;
  headShot?: boolean;
  brutalStrike?: boolean;
  divineFury?: boolean;
  psiStrike?: boolean;
  monsterSlayer?: boolean;
  grazeMiss?: boolean;
  divineStrike?: boolean;
};

/** Builds the shared damage/crit payload for weapon attack rolls. */
export function buildWeaponDamagePayload(
  options: WeaponDamageOptions,
): RollDamagePayload {
  const sneak = Boolean(options.sneakAttack);
  return {
    itemSlug: options.itemSlug,
    mode: options.mode,
    ...(options.critical ? { critical: true } : {}),
    ...(options.sightedReroll ? { sightedReroll: true } : {}),
    ...(sneak ? { sneakAttack: true } : {}),
    ...(sneak &&
    options.cunningStrikeEffects &&
    options.cunningStrikeEffects.length > 0
      ? { cunningStrikeEffects: options.cunningStrikeEffects }
      : {}),
    ...(sneak && options.poisonousSneak ? { poisonousSneak: true } : {}),
    ...(sneak && options.assassinSurprise ? { assassinSurprise: true } : {}),
    ...(sneak && options.assassinDeathStrike
      ? { assassinDeathStrike: true }
      : {}),
    ...(sneak && options.assassinPoisonFailedSave
      ? { assassinPoisonFailedSave: true }
      : {}),
    ...(options.huntersMark ? { huntersMark: true } : {}),
    ...(options.colossusSlayer ? { colossusSlayer: true } : {}),
    ...(options.dreadfulStrikes ? { dreadfulStrikes: true } : {}),
    ...(options.divineSmite ? { divineSmite: true } : {}),
    ...(options.divineSmite && options.smiteSlotLevel != null
      ? { smiteSlotLevel: options.smiteSlotLevel }
      : {}),
    ...(options.smiteVsUndeadOrFiend ? { smiteVsUndeadOrFiend: true } : {}),
    ...(options.dreadAmbusher ? { dreadAmbusher: true } : {}),
    ...(options.headShot ? { headShot: true } : {}),
    ...(options.brutalStrike ? { brutalStrike: true } : {}),
    ...(options.divineFury ? { divineFury: true } : {}),
    ...(options.psiStrike ? { psiStrike: true } : {}),
    ...(options.monsterSlayer ? { monsterSlayer: true } : {}),
    ...(options.grazeMiss ? { grazeMiss: true } : {}),
    ...(options.divineStrike ? { divineStrike: true } : {}),
  };
}

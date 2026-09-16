export const MAGIC_MISSILE_SPELL_SLUG = "misseis-magicos";
export const MAGIC_MISSILE_FREE_CAST_TABLE_ACTION = "cast:misseis-magicos-free";
export const MISSILE_SHIELD_RESOURCE = "missile-shield";
export const GIGA_MISSILE_RESOURCE = "giga-missile";
export const MAGIC_MISSILE_MAGE_SUBCLASS = "magic-missile-mage";

export type MissileCastBoostSnapshot = {
  shieldRemaining: number;
  gigaRemaining: number;
  shieldArmed: boolean;
  gigaArmed: boolean;
};

export function resourceRemaining(
  resources: { slug: string; remaining: number }[] | undefined,
  slug: string,
): number {
  return resources?.find((item) => item.slug === slug)?.remaining ?? 0;
}

export function readMissileCastBoostSnapshot(input: {
  classResources?: { slug: string; remaining: number }[];
  missileShieldArmed?: boolean;
  gigaMissileArmed?: boolean;
}): MissileCastBoostSnapshot {
  return {
    shieldRemaining: resourceRemaining(
      input.classResources,
      MISSILE_SHIELD_RESOURCE,
    ),
    gigaRemaining: resourceRemaining(
      input.classResources,
      GIGA_MISSILE_RESOURCE,
    ),
    shieldArmed: Boolean(input.missileShieldArmed),
    gigaArmed: Boolean(input.gigaMissileArmed),
  };
}

export function shouldOfferMissileBoostModal(input: {
  isMissileMage: boolean;
  spellSlug: string;
  snapshot: MissileCastBoostSnapshot;
}): boolean {
  if (!input.isMissileMage) return false;
  if (input.spellSlug !== MAGIC_MISSILE_SPELL_SLUG) return false;
  const canChooseShield =
    !input.snapshot.shieldArmed && input.snapshot.shieldRemaining > 0;
  const canChooseGiga =
    !input.snapshot.gigaArmed && input.snapshot.gigaRemaining > 0;
  return canChooseShield || canChooseGiga;
}

export function missileBoostFlagsFromChoice(input: {
  snapshot: MissileCastBoostSnapshot;
  applyShield: boolean;
  applyGiga: boolean;
}): { applyMissileShield: boolean; applyGigaMissile: boolean } {
  return {
    applyMissileShield: input.snapshot.shieldArmed || input.applyShield,
    applyGigaMissile: input.snapshot.gigaArmed || input.applyGiga,
  };
}

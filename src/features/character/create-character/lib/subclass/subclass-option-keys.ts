export const LORE_MAGICAL_DISCOVERY_KEYS = new Set([
  "magicalDiscovery1",
  "magicalDiscovery2",
]);

export const BLADE_HOLY_CANTRIP_KEYS = new Set([
  "holyRevelationCantrip1",
  "holyRevelationCantrip2",
]);

export const LORE_BONUS_SKILL_KEYS = new Set([
  "loreBonusSkill1",
  "loreBonusSkill2",
  "loreBonusSkill3",
]);

export const WIZARD_VERSATILITY_OPTION_KEYS = new Set([
  "abjurationVersatility1",
  "abjurationVersatility2",
  "divinationVersatility1",
  "divinationVersatility2",
  "evocationVersatility1",
  "evocationVersatility2",
  "illusionVersatility1",
  "illusionVersatility2",
]);

export function loreMagicalDiscoveryMaxLevel(level: number): number {
  return Math.min(3, Math.ceil(level / 2));
}

export function isDynamicSubclassOptionValueType(valueType: string): boolean {
  return valueType === "skill_list" || valueType === "spell";
}

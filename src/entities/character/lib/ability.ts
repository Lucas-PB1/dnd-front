export function abilityModifierValue(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatAbilityModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : String(mod);
}

export function abilityModifier(score: number): string {
  return formatAbilityModifier(abilityModifierValue(score));
}

export function skillBonus(
  abilityScore: number,
  proficient: boolean,
  proficiencyBonus: number,
  expertise = false,
): number {
  const mod = abilityModifierValue(abilityScore);
  if (expertise) return mod + proficiencyBonus * 2;
  if (proficient) return mod + proficiencyBonus;
  return mod;
}

export function formatSkillBonus(bonus: number): string {
  return formatAbilityModifier(bonus);
}

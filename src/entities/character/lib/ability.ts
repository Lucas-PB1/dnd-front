export function abilityModifierValue(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatAbilityModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : String(mod);
}

export function abilityModifier(score: number): string {
  return formatAbilityModifier(abilityModifierValue(score));
}

/** Bônus total de perícia: mod do atributo + PB se proficiente */
export function skillBonus(
  abilityScore: number,
  proficient: boolean,
  proficiencyBonus: number,
): number {
  return (
    abilityModifierValue(abilityScore) + (proficient ? proficiencyBonus : 0)
  );
}

export function formatSkillBonus(bonus: number): string {
  return formatAbilityModifier(bonus);
}

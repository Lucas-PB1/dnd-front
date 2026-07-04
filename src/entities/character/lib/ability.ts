import type { AbilityScores } from "@/entities/character/types";

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

const ABILITY_FOR_SKILL: Record<string, keyof AbilityScores> = {
  athletics: "forca",
  acrobatics: "destreza",
  "sleight-of-hand": "destreza",
  stealth: "destreza",
  arcana: "inteligencia",
  history: "inteligencia",
  investigation: "inteligencia",
  nature: "inteligencia",
  religion: "inteligencia",
  "animal-handling": "sabedoria",
  insight: "sabedoria",
  medicine: "sabedoria",
  perception: "sabedoria",
  survival: "sabedoria",
  deception: "carisma",
  intimidation: "carisma",
  performance: "carisma",
  persuasion: "carisma",
};

/** Fallback quando o catálogo de skills não está carregado */
export function defaultAbilityForSkill(
  skillSlug: string,
): keyof AbilityScores | null {
  return ABILITY_FOR_SKILL[skillSlug] ?? null;
}

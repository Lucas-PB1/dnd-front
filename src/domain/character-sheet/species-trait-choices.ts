import type { SkillKey } from "@/domain/character-sheet/constants";
import { SKILL_DEFINITIONS } from "@/domain/character-sheet/constants";
import type { CharacterSpeciesId } from "@/domain/character-sheet/origins";
import type { SpeciesTrait } from "@/domain/character-sheet/species-details";
import {
  findSpeciesDetails,
  formatSpeciesTrait,
} from "@/domain/character-sheet/species-details";
import { SKILL_LABELS_PT } from "@/domain/character-sheet/skill-labels-pt";

export type SpeciesSkillChoiceDefinition = {
  traitTitle: string;
  skillOptions: readonly SkillKey[] | "any";
};

export type SpeciesTraitChoicesConfig = {
  skillChoice?: SpeciesSkillChoiceDefinition;
  originFeatChoice?: boolean;
};

/** Traços com escolha do jogador — PHB 2024 Cap. 4 */
export const SPECIES_TRAIT_CHOICES: Partial<
  Record<CharacterSpeciesId, SpeciesTraitChoicesConfig>
> = {
  human: {
    skillChoice: { traitTitle: "Hábil", skillOptions: "any" },
    originFeatChoice: true,
  },
  elf: {
    skillChoice: {
      traitTitle: "Sentidos Aguçados",
      skillOptions: ["insight", "perception", "survival"],
    },
  },
};

export const ORIGIN_FEATS = [
  "Alerta",
  "Artifista",
  "Atacante Selvagem",
  "Curandeiro",
  "Habilidoso",
  "Iniciado em Magia (Clérigo)",
  "Iniciado em Magia (Druida)",
  "Iniciado em Magia (Mago)",
  "Músico",
  "Sortudo",
  "Valentão de Taverna",
  "Vigoroso",
] as const;

export function getSpeciesTraitChoicesConfig(
  speciesId: string,
): SpeciesTraitChoicesConfig | undefined {
  return SPECIES_TRAIT_CHOICES[speciesId as CharacterSpeciesId];
}

export function getSpeciesSkillChoicePool(speciesId: string): SkillKey[] {
  const config = getSpeciesTraitChoicesConfig(speciesId)?.skillChoice;

  if (!config) {
    return [];
  }

  if (config.skillOptions === "any") {
    return SKILL_DEFINITIONS.map((skill) => skill.key);
  }

  return [...config.skillOptions];
}

export function isValidSpeciesSkillChoice(
  speciesId: string,
  skillChoice: string,
): boolean {
  if (!skillChoice) {
    return false;
  }

  return getSpeciesSkillChoicePool(speciesId).includes(skillChoice as SkillKey);
}

export function formatTraitLine(
  trait: SpeciesTrait,
  speciesId: string,
  options: { skillChoice?: string; originFeat?: string },
): string {
  const config = getSpeciesTraitChoicesConfig(speciesId);

  if (
    config?.skillChoice?.traitTitle === trait.title &&
    options.skillChoice &&
    isValidSpeciesSkillChoice(speciesId, options.skillChoice)
  ) {
    return `${trait.title} — Proficiência em ${SKILL_LABELS_PT[options.skillChoice as SkillKey]}.`;
  }

  if (
    config?.originFeatChoice &&
    trait.title === "Versátil" &&
    options.originFeat?.trim()
  ) {
    return `${trait.title} — Talento de Origem: ${options.originFeat.trim()}.`;
  }

  return formatSpeciesTrait(trait);
}

export function formatSpeciesTraitsForSheet(
  speciesId: string,
  options: { skillChoice?: string; originFeat?: string } = {},
): string {
  const species = findSpeciesDetails(speciesId);

  if (!species) {
    return "";
  }

  return species.traits
    .map((trait) => formatTraitLine(trait, speciesId, options))
    .join("\n");
}

export function speciesHasOriginFeatChoice(speciesId: string): boolean {
  return Boolean(getSpeciesTraitChoicesConfig(speciesId)?.originFeatChoice);
}

export function speciesHasSkillChoice(speciesId: string): boolean {
  return Boolean(getSpeciesTraitChoicesConfig(speciesId)?.skillChoice);
}

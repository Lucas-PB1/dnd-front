import type { CharacterSheetInput } from "@/entities/character/sheet-types";
import type {
  CharacterEquipment,
  CharacterSpell,
  SpeciesChoice,
  SubclassOption,
} from "@/entities/character/sheet-types";

export type {
  CharacterEquipment,
  CharacterSpell,
  CharacterSheetInput,
  SpeciesChoice,
  SubclassOption,
} from "@/entities/character/sheet-types";

/** Atributos PHB — slugs em PT como na API */
export type AbilityScores = {
  forca: number;
  destreza: number;
  constituicao: number;
  inteligencia: number;
  sabedoria: number;
  carisma: number;
};

/** Espelha CharacterResponseDto da dnd-api */
export type CharacterDetail = {
  id: string;
  name: string;
  level: number;
  classSlug: string;
  speciesSlug: string;
  backgroundSlug: string;
  subclassSlug: string | null;
  alignmentSlug: string | null;
  abilityScores: AbilityScores;
  hitPointsMax: number | null;
  hitPointsCurrent: number | null;
  proficiencyBonus: number;
  classSkillSlugs: string[];
  backgroundSkillSlugs: string[];
  speciesChoices: SpeciesChoice[];
  subclassOptions: SubclassOption[];
  featSlugs: string[];
  characterSpells: CharacterSpell[];
  equipment: CharacterEquipment[];
  languageSlugs: string[];
  abilityGenerationMethodSlug: string | null;
  backgroundAbilityBoostPlus2Slug: string | null;
  backgroundAbilityBoostPlus1Slug: string | null;
  backgroundToolItemSlug: string | null;
  abilityModifiers: AbilityScores;
  passivePerception: number;
  armorClass: number;
  createdAt: string;
  updatedAt: string;
};

/** Lista resumida (mesmos campos base do detail) */
export type CharacterSummary = Pick<
  CharacterDetail,
  | "id"
  | "name"
  | "level"
  | "classSlug"
  | "speciesSlug"
  | "backgroundSlug"
  | "subclassSlug"
  | "createdAt"
  | "updatedAt"
>;

/** Payload para POST /characters — espelha CreateCharacterDto */
export type CreateCharacterPayload = {
  name: string;
  classSlug: string;
  speciesSlug: string;
  backgroundSlug: string;
  level?: number;
  subclassSlug?: string;
  alignmentSlug?: string;
  abilityScores?: AbilityScores;
  backgroundAbilityBoostPlus2Slug?: string;
  backgroundAbilityBoostPlus1Slug?: string;
  backgroundToolItemSlug?: string;
  hitPointsMax?: number;
  hitPointsCurrent?: number;
} & CharacterSheetInput;

/** Payload para PATCH /characters/:id — espelha UpdateCharacterDto */
export type UpdateCharacterPayload = Partial<CreateCharacterPayload>;

export const ABILITY_LABELS_PT: Record<keyof AbilityScores, string> = {
  forca: "Força",
  destreza: "Destreza",
  constituicao: "Constituição",
  inteligencia: "Inteligência",
  sabedoria: "Sabedoria",
  carisma: "Carisma",
};

export { abilityModifier } from "@/entities/character/lib/ability";

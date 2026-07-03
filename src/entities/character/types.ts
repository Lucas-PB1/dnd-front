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
  featSlugs: string[];
  languageSlugs: string[];
  abilityGenerationMethodSlug: string | null;
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

/** Payload para POST /characters */
export type CreateCharacterPayload = {
  name: string;
  level?: number;
  classSlug: string;
  speciesSlug: string;
  backgroundSlug: string;
  subclassSlug?: string;
};

export const ABILITY_LABELS_PT: Record<keyof AbilityScores, string> = {
  forca: "Força",
  destreza: "Destreza",
  constituicao: "Constituição",
  inteligencia: "Inteligência",
  sabedoria: "Sabedoria",
  carisma: "Carisma",
};

export function abilityModifier(score: number): string {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : String(mod);
}

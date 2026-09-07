/** Escolhas persistidas na ficha — espelham character-sheet.dto da dnd-api */

import type { CharacterFeat } from "@/entities/character/lib/character-feat";

export type { CharacterFeat };

export type SpeciesChoice = {
  choiceKind: string;
  choiceSlug: string;
};

export type SubclassOption = {
  optionKey: string;
  valueId: string;
};

export type ClassOption = {
  optionKey: string;
  valueId: string;
  instanceIndex?: number;
};

export type FeatOption = {
  featSlug: string;
  instanceIndex: number;
  optionKey: string;
  valueId: string;
};

export type CharacterSpell = {
  spellSlug: string;
  listType: "known" | "prepared" | "always_prepared";
  source?: "class" | "subclass" | "feat" | "species";
  /** Economia de cast (API — magias concedidas / enriquecidas). */
  castEconomy?: "at_will" | "once_per_long_rest" | "slot_only";
};

export type CharacterEquipment = {
  source: "class" | "background";
  packageSlug: string;
  itemSlug?: string;
  quantity?: number;
  sortOrder?: number;
};

/** Transformação GH Cap. 6 — espelha CharacterTransformationDto. */
export type CharacterTransformation = {
  slug: string;
  stage: number;
  choices: SpeciesChoice[];
};

export type CharacterSheetInput = {
  classSkillSlugs?: string[];
  speciesChoices?: SpeciesChoice[];
  heritageChoices?: SpeciesChoice[];
  transformation?: CharacterTransformation | null;
  subclassOptions?: SubclassOption[];
  classOptions?: ClassOption[];
  characterFeats?: CharacterFeat[];
  featOptions?: FeatOption[];
  characterSpells?: CharacterSpell[];
  equipment?: CharacterEquipment[];
  languageSlugs?: string[];
  abilityGenerationMethodSlug?: string;
};

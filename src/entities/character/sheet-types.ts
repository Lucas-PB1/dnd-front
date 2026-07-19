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

export type FeatOption = {
  featSlug: string;
  instanceIndex: number;
  optionKey: string;
  valueId: string;
};

export type CharacterSpell = {
  spellSlug: string;
  listType: "known" | "prepared" | "always_prepared";
};

export type CharacterEquipment = {
  source: "class" | "background";
  packageSlug: string;
  itemSlug?: string;
  quantity?: number;
  sortOrder?: number;
};

export type CharacterSheetInput = {
  classSkillSlugs?: string[];
  speciesChoices?: SpeciesChoice[];
  subclassOptions?: SubclassOption[];
  characterFeats?: CharacterFeat[];
  featOptions?: FeatOption[];
  characterSpells?: CharacterSpell[];
  equipment?: CharacterEquipment[];
  languageSlugs?: string[];
  abilityGenerationMethodSlug?: string;
};

import {
  appendCharacterFeat,
  canAddCharacterFeat,
} from "@/entities/character/lib/character-feat";
import type { CharacterDetail } from "@/entities/character/types";
import type {
  CharacterFeat,
  ClassOption,
  FeatOption,
  SubclassOption,
} from "@/entities/character/sheet-types";
import type {
  LevelUpAsiDistributionMode,
  LevelUpPayload,
  LevelUpPreview,
} from "@/entities/character/session-types";
import { isLevelUpAsiComplete } from "@/features/character/character-sheet/ui/level-up/level-up-asi-picker";
import { findIncompleteCreateFeatOptions } from "@/features/character/create-character/lib/feats/validate-create-feat-options";
import { subclassOptionsComplete } from "@/features/character/character-sheet/ui/level-up/subclass-options-editor";

type FeatCatalogItem = {
  slug: string;
  name: string;
  repeatable: boolean;
};

type SubmitLevelUpInput = {
  data: LevelUpPreview;
  character: CharacterDetail;
  subclassSlug: string;
  asiMode: LevelUpAsiDistributionMode | "";
  asiPrimary: string;
  asiSecondary: string;
  selectedFeatSlug: string;
  levelUpFeatOptions: FeatOption[];
  levelUpClassOptions: ClassOption[];
  levelUpSubclassOptions: SubclassOption[];
  /** Slots efetivos (preview ou draft no unlock da subclasse). */
  subclassOptionSlots: { optionKey: string }[];
  newFeatInstance: CharacterFeat | null;
  hasFeatOptions: boolean;
  featNameBySlug: Record<string, string>;
  feats: FeatCatalogItem[];
  mutateAsync: (
    payload: LevelUpPayload,
  ) => Promise<CharacterDetail | undefined>;
};

export type SubmitLevelUpResult =
  | { ok: true; updated: CharacterDetail | undefined }
  | { ok: false; error: string };

export async function submitLevelUp({
  data,
  character,
  subclassSlug,
  asiMode,
  asiPrimary,
  asiSecondary,
  selectedFeatSlug,
  levelUpFeatOptions,
  levelUpClassOptions,
  levelUpSubclassOptions,
  subclassOptionSlots,
  newFeatInstance,
  hasFeatOptions,
  featNameBySlug,
  feats,
  mutateAsync,
}: SubmitLevelUpInput): Promise<SubmitLevelUpResult> {
  if (data.isAsiOrFeatLevel && asiMode && selectedFeatSlug) {
    return {
      ok: false,
      error: "Escolha ASI ou talento neste nível — não os dois.",
    };
  }
  if (
    data.isAsiOrFeatLevel &&
    !isLevelUpAsiComplete(asiMode, asiPrimary, asiSecondary)
  ) {
    return {
      ok: false,
      error: "Complete a melhoria de atributo ou deixe em branco.",
    };
  }

  const newExpertiseSlots = data.newClassExpertiseSlots ?? [];
  const newMasterySlots = data.newWeaponMasterySlots ?? [];
  if (
    subclassOptionSlots.length > 0 &&
    !subclassOptionsComplete(
      subclassOptionSlots.map((slot) => slot.optionKey),
      levelUpSubclassOptions,
    )
  ) {
    return {
      ok: false,
      error: "Complete as escolhas de subclasse deste nível.",
    };
  }

  const payload: LevelUpPayload = {};
  if (data.subclassRequired && subclassSlug) {
    payload.subclassSlug = subclassSlug;
  }
  if (data.isAsiOrFeatLevel && asiMode) {
    payload.asiDistributionMode = asiMode;
    payload.asiPrimaryAbilitySlug = asiPrimary;
    if (asiMode === "plus1plus1") {
      payload.asiSecondaryAbilitySlug = asiSecondary;
    }
  }
  if (
    data.isAsiOrFeatLevel &&
    !asiMode &&
    selectedFeatSlug &&
    newFeatInstance
  ) {
    const feat = feats.find((item) => item.slug === selectedFeatSlug);
    if (
      feat &&
      canAddCharacterFeat(character.characterFeats, selectedFeatSlug)
    ) {
      if (hasFeatOptions) {
        const incomplete = await findIncompleteCreateFeatOptions(
          [newFeatInstance],
          levelUpFeatOptions,
          featNameBySlug,
          character.level + 1,
        );
        if (incomplete) {
          return { ok: false, error: incomplete };
        }
      }

      payload.characterFeats = appendCharacterFeat(
        character.characterFeats,
        selectedFeatSlug,
      );
      if (levelUpFeatOptions.length > 0) {
        payload.featOptions = [...character.featOptions, ...levelUpFeatOptions];
      }
    }
  }
  if (newExpertiseSlots.length > 0 || newMasterySlots.length > 0) {
    payload.classOptions = levelUpClassOptions;
    // A API valida expertise contra proficiências já salvas; envia o contexto
    // (featOptions fica a cargo do ramo ASI/talento ou do snapshot na API).
    payload.classSkillSlugs = character.classSkillSlugs;
    payload.speciesChoices = character.speciesChoices;
  }
  if (subclassOptionSlots.length > 0) {
    payload.subclassOptions = levelUpSubclassOptions;
  }

  const updated = await mutateAsync(payload);
  return { ok: true, updated };
}

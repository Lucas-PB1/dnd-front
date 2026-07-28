import {
  appendCharacterFeat,
  canAddCharacterFeat,
} from "@/entities/character/lib/character-feat";
import type { CharacterDetail } from "@/entities/character/types";
import type {
  CharacterFeat,
  ClassOption,
  FeatOption,
} from "@/entities/character/sheet-types";
import type {
  LevelUpAsiDistributionMode,
  LevelUpPayload,
  LevelUpPreview,
} from "@/entities/character/session-types";
import { isLevelUpAsiComplete } from "@/features/character-sheet/ui/level-up/level-up-asi-picker";
import { findIncompleteCreateFeatOptions } from "@/features/create-character/lib/feats/validate-create-feat-options";

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
  newFeatInstance: CharacterFeat | null;
  hasFeatOptions: boolean;
  featNameBySlug: Record<string, string>;
  feats: FeatCatalogItem[];
  mutateAsync: (payload: LevelUpPayload) => Promise<CharacterDetail | undefined>;
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
  newFeatInstance,
  hasFeatOptions,
  featNameBySlug,
  feats,
  mutateAsync,
}: SubmitLevelUpInput): Promise<SubmitLevelUpResult> {
  if (data.isAsiOrFeatLevel && asiMode && selectedFeatSlug) {
    return { ok: false, error: "Escolha ASI ou talento neste nível — não os dois." };
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
      canAddCharacterFeat(
        character.characterFeats,
        selectedFeatSlug,
        feat.repeatable,
      )
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
  }

  const updated = await mutateAsync(payload);
  return { ok: true, updated };
}

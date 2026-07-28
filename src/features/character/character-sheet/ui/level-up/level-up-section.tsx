"use client";

import { useMemo, useState } from "react";

import { appendCharacterFeat } from "@/entities/character/lib/character-feat";
import type { CharacterDetail } from "@/entities/character/types";
import type { ClassOption } from "@/entities/character/sheet-types";
import type { FeatOption } from "@/entities/character/sheet-types";
import type { LevelUpAsiDistributionMode } from "@/entities/character/session-types";
import {
  useLevelUp,
  useLevelUpPreview,
} from "@/features/character/character-sheet/api/use-character-progression";
import { submitLevelUp } from "@/features/character/character-sheet/lib/level-up/submit-level-up";
import { LevelUpAsiFeatPanel } from "@/features/character/character-sheet/ui/level-up/level-up-asi-feat-panel";
import { LevelUpClassFeaturesSection } from "@/features/character/character-sheet/ui/level-up/level-up-class-features-section";
import {
  levelUpExpertiseComplete,
} from "@/features/character/character-sheet/ui/level-up/level-up-class-expertise";
import { LevelUpPreviewSummary } from "@/features/character/character-sheet/ui/level-up/level-up-preview-summary";
import { LevelUpSubmitFooter } from "@/features/character/character-sheet/ui/level-up/level-up-submit-footer";
import {
  levelUpWeaponMasteryComplete,
} from "@/features/character/character-sheet/ui/level-up/level-up-weapon-mastery";
import { useFeatOptions } from "@/features/catalog/feat-catalog/api/use-feat-options";
import { useFeats } from "@/features/catalog/reference-catalog/api/use-reference";

type LevelUpSectionProps = {
  characterId: string;
  character: CharacterDetail;
};

export function LevelUpSection({
  characterId,
  character,
}: LevelUpSectionProps) {
  const canLevelUp = character.level < 20;
  const preview = useLevelUpPreview(characterId, canLevelUp);
  const levelUp = useLevelUp(characterId);
  const feats = useFeats();

  const [subclassSlug, setSubclassSlug] = useState(
    character.subclassSlug ?? "",
  );
  const [selectedFeatSlug, setSelectedFeatSlug] = useState("");
  const [levelUpFeatOptions, setLevelUpFeatOptions] = useState<FeatOption[]>(
    [],
  );
  const [levelUpClassOptions, setLevelUpClassOptions] = useState<ClassOption[]>(
    () => character.classOptions ?? [],
  );
  const [asiMode, setAsiMode] = useState<LevelUpAsiDistributionMode | "">("");
  const [asiPrimary, setAsiPrimary] = useState("");
  const [asiSecondary, setAsiSecondary] = useState("");
  const [levelUpError, setLevelUpError] = useState<string | undefined>();

  const newFeatInstance = useMemo(() => {
    if (!selectedFeatSlug) return null;
    const merged = appendCharacterFeat(
      character.characterFeats,
      selectedFeatSlug,
    );
    return merged[merged.length - 1] ?? null;
  }, [selectedFeatSlug, character.characterFeats]);

  const selectedFeatOptionDefs = useFeatOptions(
    selectedFeatSlug,
    !!selectedFeatSlug,
  );
  const hasFeatOptions = (selectedFeatOptionDefs.data?.data.length ?? 0) > 0;

  const featNameBySlug = useMemo(
    () =>
      Object.fromEntries(
        (feats.data?.data ?? []).map((feat) => [feat.slug, feat.name]),
      ),
    [feats.data?.data],
  );

  if (!canLevelUp) {
    return (
      <p className="text-sm text-muted-foreground">
        Personagem no nível máximo (20).
      </p>
    );
  }

  if (preview.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando preview…</p>;
  }

  const data = preview.data;
  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        Preview de level-up indisponível.
      </p>
    );
  }

  const levelUpPreview = data;
  const newExpertiseSlots = levelUpPreview.newClassExpertiseSlots ?? [];
  const newMasterySlots = levelUpPreview.newWeaponMasterySlots ?? [];
  const expertiseComplete = levelUpExpertiseComplete(
    newExpertiseSlots,
    levelUpClassOptions,
  );
  const masteryComplete = levelUpWeaponMasteryComplete(
    newMasterySlots,
    levelUpClassOptions,
  );

  async function handleLevelUp() {
    setLevelUpError(undefined);

    const result = await submitLevelUp({
      data: levelUpPreview,
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
      feats: feats.data?.data ?? [],
      mutateAsync: levelUp.mutateAsync,
    });

    if (!result.ok) {
      setLevelUpError(result.error);
      return;
    }

    setSelectedFeatSlug("");
    setLevelUpFeatOptions([]);
    setAsiMode("");
    setAsiPrimary("");
    setAsiSecondary("");
    if (result.updated) {
      setLevelUpClassOptions(result.updated.classOptions ?? []);
    }
  }

  return (
    <div className="space-y-4">
      <LevelUpPreviewSummary {...levelUpPreview} />

      {levelUpPreview.isAsiOrFeatLevel ? (
        <LevelUpAsiFeatPanel
          character={character}
          featsPending={feats.isPending}
          feats={feats.data?.data ?? []}
          featNameBySlug={featNameBySlug}
          newFeatInstance={newFeatInstance}
          asiMode={asiMode}
          asiPrimary={asiPrimary}
          asiSecondary={asiSecondary}
          selectedFeatSlug={selectedFeatSlug}
          levelUpFeatOptions={levelUpFeatOptions}
          onAsiModeChange={setAsiMode}
          onAsiPrimaryChange={setAsiPrimary}
          onAsiSecondaryChange={setAsiSecondary}
          onSelectedFeatSlugChange={setSelectedFeatSlug}
          onLevelUpFeatOptionsChange={setLevelUpFeatOptions}
          onInteraction={() => setLevelUpError(undefined)}
        />
      ) : null}

      <LevelUpClassFeaturesSection
        character={character}
        subclassRequired={levelUpPreview.subclassRequired}
        subclassUnlockLevel={levelUpPreview.subclassUnlockLevel}
        newSpellOptionsCount={levelUpPreview.newSpellOptions.length}
        newExpertiseSlots={newExpertiseSlots}
        newMasterySlots={newMasterySlots}
        subclassSlug={subclassSlug}
        onSubclassChange={setSubclassSlug}
        classOptions={levelUpClassOptions}
        onClassOptionsChange={setLevelUpClassOptions}
      />

      <LevelUpSubmitFooter
        nextLevel={data.nextLevel}
        levelUpError={levelUpError}
        disabled={
          (data.subclassRequired && !subclassSlug) ||
          (newExpertiseSlots.length > 0 && !expertiseComplete) ||
          (newMasterySlots.length > 0 && !masteryComplete)
        }
        levelUp={levelUp}
        onSubmit={handleLevelUp}
      />
    </div>
  );
}

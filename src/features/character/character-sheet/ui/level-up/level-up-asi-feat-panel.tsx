"use client";

import { canAddCharacterFeat } from "@/entities/character/lib/character-feat";
import type { CharacterDetail } from "@/entities/character/types";
import type {
  CharacterFeat,
  FeatOption,
} from "@/entities/character/sheet-types";
import type { LevelUpAsiDistributionMode } from "@/entities/character/session-types";
import type { FeatSummary } from "@/entities/feat/types";
import { LevelUpAsiPicker } from "@/features/character/character-sheet/ui/level-up/level-up-asi-picker";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import { skillChoiceKinds } from "@/features/character/create-character/lib/class-skills/granted-proficiencies";
import { useClassDetail } from "@/features/catalog/class-catalog/api/use-classes";
import { useFeatOptions } from "@/features/catalog/feat-catalog/api/use-feat-options";
import { meetsFeatRequirements } from "@/features/catalog/feat-catalog/lib/feat-eligibility";
import { FeatOptionsEditor } from "@/features/catalog/feat-catalog/ui/options/feat-options-editor";

type FeatCatalogItem = Pick<
  FeatSummary,
  | "slug"
  | "name"
  | "repeatable"
  | "categorySlug"
  | "minimumLevel"
  | "abilityPrerequisites"
  | "requiresSpellcasting"
  | "requiredArmorTrainingSlug"
  | "requiresFightingStyle"
  | "requiresWeaponMastery"
  | "requiredFeatSlugs"
  | "requiredSkillSlugs"
  | "requiredSpeciesSlugs"
  | "requiredWeaponProficiencySlugs"
  | "requiredFeatOptions"
>;

type LevelUpAsiFeatPanelProps = {
  character: CharacterDetail;
  featsPending: boolean;
  feats: FeatCatalogItem[];
  featNameBySlug: Record<string, string>;
  newFeatInstance: CharacterFeat | null;
  asiMode: LevelUpAsiDistributionMode | "";
  asiPrimary: string;
  asiSecondary: string;
  selectedFeatSlug: string;
  levelUpFeatOptions: FeatOption[];
  onAsiModeChange: (mode: LevelUpAsiDistributionMode | "") => void;
  onAsiPrimaryChange: (slug: string) => void;
  onAsiSecondaryChange: (slug: string) => void;
  onSelectedFeatSlugChange: (slug: string) => void;
  onLevelUpFeatOptionsChange: (options: FeatOption[]) => void;
  onInteraction: () => void;
};

export function LevelUpAsiFeatPanel({
  character,
  featsPending,
  feats,
  featNameBySlug,
  newFeatInstance,
  asiMode,
  asiPrimary,
  asiSecondary,
  selectedFeatSlug,
  levelUpFeatOptions,
  onAsiModeChange,
  onAsiPrimaryChange,
  onAsiSecondaryChange,
  onSelectedFeatSlugChange,
  onLevelUpFeatOptionsChange,
  onInteraction,
}: LevelUpAsiFeatPanelProps) {
  const classDetail = useClassDetail(character.classSlug);
  const selectedFeatOptionDefs = useFeatOptions(
    selectedFeatSlug,
    !!selectedFeatSlug,
  );
  const hasFeatOptions = (selectedFeatOptionDefs.data?.data.length ?? 0) > 0;
  const nextLevel = character.level + 1;
  const skillKinds = skillChoiceKinds();
  const skillSlugs = [
    ...new Set([
      ...character.classSkillSlugs,
      ...character.backgroundSkillSlugs,
      ...character.speciesChoices
        .filter((choice) => skillKinds.has(choice.choiceKind))
        .map((choice) => choice.choiceSlug),
    ]),
  ];
  const eligibility = {
    level: nextLevel,
    abilityScores: character.abilityScores,
    hasSpellcasting: character.spellcastingAbilitySlug !== null,
    armorTrainingSlugs: classDetail.data?.armorTrainingSlugs ?? [],
    hasFightingStyleFeature:
      (classDetail.data?.fightingStyleSlugs?.length ?? 0) > 0,
    hasWeaponMasteryFeature:
      classDetail.data?.weaponMasteryEligibility != null,
    ownedFeatSlugs: character.characterFeats.map((feat) => feat.featSlug),
    skillSlugs,
    speciesSlug: character.speciesSlug,
    weaponProficiencySlugs: classDetail.data?.weaponProficiencySlugs ?? [],
    ownedFeatOptions: character.featOptions.map((option) => ({
      featSlug: option.featSlug,
      optionKey: option.optionKey,
      valueId: option.valueId,
    })),
  };

  return (
    <div className="space-y-4 rounded-md border border-border bg-muted/30 px-3 py-3 text-sm">
      <p className="text-muted-foreground">
        Neste nível escolha{" "}
        <span className="font-medium text-foreground">ASI</span> ou um{" "}
        <span className="font-medium text-foreground">talento</span> (não os
        dois).
      </p>
      <LevelUpAsiPicker
        scores={character.abilityScores}
        mode={asiMode}
        primarySlug={asiPrimary}
        secondarySlug={asiSecondary}
        disabled={!!selectedFeatSlug}
        onModeChange={(mode) => {
          onAsiModeChange(mode);
          onInteraction();
          if (mode) {
            onSelectedFeatSlugChange("");
            onLevelUpFeatOptionsChange([]);
          }
        }}
        onPrimaryChange={onAsiPrimaryChange}
        onSecondaryChange={onAsiSecondaryChange}
      />
      <div className="border-t border-border pt-3 space-y-3">
        {featsPending ? (
          <p className="text-muted-foreground">Carregando talentos…</p>
        ) : (
          <CatalogSelect
            id="level-up-feat"
            label="Ou adicionar talento"
            disabled={!!asiMode}
            options={[
              { value: "", label: "Nenhum talento" },
              ...feats
                .filter(
                  (feat) =>
                    canAddCharacterFeat(character.characterFeats, feat.slug) &&
                    (feat.categorySlug === "general" ||
                      (feat.categorySlug === "epic-boon" && nextLevel >= 19) ||
                      feat.categorySlug === "fighting-style") &&
                    meetsFeatRequirements(feat, eligibility),
                )
                .map((feat) => ({
                  value: feat.slug,
                  label: feat.repeatable
                    ? `${feat.name} (repetível)`
                    : feat.name,
                })),
            ]}
            value={selectedFeatSlug}
            onChange={(e) => {
              onSelectedFeatSlugChange(e.target.value);
              onLevelUpFeatOptionsChange([]);
              onInteraction();
              if (e.target.value) {
                onAsiModeChange("");
                onAsiPrimaryChange("");
                onAsiSecondaryChange("");
              }
            }}
          />
        )}
        {hasFeatOptions && newFeatInstance ? (
          <FeatOptionsEditor
            characterFeats={[newFeatInstance]}
            featNameBySlug={featNameBySlug}
            value={levelUpFeatOptions}
            characterLevel={character.level + 1}
            classSlug={character.classSlug}
            onChange={onLevelUpFeatOptionsChange}
          />
        ) : null}
      </div>
    </div>
  );
}

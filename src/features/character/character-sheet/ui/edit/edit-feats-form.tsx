"use client";

import { useState } from "react";

import type {
  CharacterFeat,
  FeatOption,
} from "@/entities/character/sheet-types";
import {
  appendCharacterFeat,
  canAddCharacterFeat,
  featInstanceKey,
  formatCharacterFeatLabel,
} from "@/entities/character/lib/character-feat";
import {
  EditFormShell,
  useSectionPatch,
  type EditFormProps,
} from "@/features/character/character-sheet/ui/edit/edit-form-shell";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import { useClassDetail } from "@/features/catalog/class-catalog/api/use-classes";
import { meetsFeatRequirements } from "@/features/catalog/feat-catalog/lib/feat-eligibility";
import { FeatOptionsEditor } from "@/features/catalog/feat-catalog/ui/options/feat-options-editor";
import { useFeats } from "@/features/catalog/reference-catalog/api/use-reference";
import { skillChoiceKinds } from "@/features/character/create-character/lib/class-skills/granted-proficiencies";
import { Button } from "@/shared/ui/button";

export function EditFeatsForm({
  character,
  onSuccess,
  onCancel,
}: EditFormProps) {
  const { patch, formError, submit } = useSectionPatch(character, onSuccess);
  const feats = useFeats();
  const classDetail = useClassDetail(character.classSlug);
  const [characterFeats, setCharacterFeats] = useState<CharacterFeat[]>(
    character.characterFeats,
  );
  const [featOptions, setFeatOptions] = useState<FeatOption[]>(
    character.featOptions,
  );
  const [addFeatSlug, setAddFeatSlug] = useState("");

  const featNameBySlug = Object.fromEntries(
    (feats.data?.data ?? []).map((feat) => [feat.slug, feat.name]),
  );
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
    level: character.level,
    abilityScores: character.abilityScores,
    hasSpellcasting: character.spellcastingAbilitySlug !== null,
    armorTrainingSlugs: classDetail.data?.armorTrainingSlugs ?? [],
    hasFightingStyleFeature:
      (classDetail.data?.fightingStyleSlugs?.length ?? 0) > 0,
    hasWeaponMasteryFeature:
      classDetail.data?.weaponMasteryEligibility != null,
    ownedFeatSlugs: characterFeats.map((feat) => feat.featSlug),
    skillSlugs,
    speciesSlug: character.speciesSlug,
    weaponProficiencySlugs: classDetail.data?.weaponProficiencySlugs ?? [],
    ownedFeatOptions: featOptions.map((option) => ({
      featSlug: option.featSlug,
      optionKey: option.optionKey,
      valueId: option.valueId,
    })),
  };

  function removeFeat(feat: CharacterFeat) {
    const key = featInstanceKey(feat.featSlug, feat.instanceIndex);
    setCharacterFeats((prev) =>
      prev.filter(
        (item) => featInstanceKey(item.featSlug, item.instanceIndex) !== key,
      ),
    );
    setFeatOptions((prev) =>
      prev.filter(
        (option) =>
          !(
            option.featSlug === feat.featSlug &&
            option.instanceIndex === feat.instanceIndex
          ),
      ),
    );
  }

  function handleAddFeat() {
    if (!addFeatSlug) return;
    if (!canAddCharacterFeat(characterFeats, addFeatSlug)) return;
    setCharacterFeats((prev) => appendCharacterFeat(prev, addFeatSlug));
    setAddFeatSlug("");
  }

  const addableFeats = (feats.data?.data ?? []).filter(
    (feat) =>
      canAddCharacterFeat(characterFeats, feat.slug) &&
      meetsFeatRequirements(feat, eligibility),
  );

  return (
    <EditFormShell
      isPending={patch.isPending}
      formError={formError}
      onCancel={onCancel}
      onSubmit={(e) => {
        e.preventDefault();
        const validKeys = new Set(
          characterFeats.map((feat) =>
            featInstanceKey(feat.featSlug, feat.instanceIndex),
          ),
        );
        submit({
          characterFeats,
          featOptions: featOptions.filter((option) =>
            validKeys.has(
              featInstanceKey(option.featSlug, option.instanceIndex),
            ),
          ),
        });
      }}
    >
      {feats.isPending ? (
        <p className="text-sm text-muted-foreground">Carregando talentos…</p>
      ) : (
        <>
          <ul className="space-y-2">
            {characterFeats.map((feat) => (
              <li
                key={featInstanceKey(feat.featSlug, feat.instanceIndex)}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span className="font-medium">
                  {formatCharacterFeatLabel(
                    feat,
                    featNameBySlug,
                    characterFeats,
                  )}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFeat(feat)}
                >
                  Remover
                </Button>
              </li>
            ))}
          </ul>
          {addableFeats.length > 0 ? (
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[220px] flex-1">
                <CatalogSelect
                  id="add-feat"
                  label="Adicionar talento"
                  options={[
                    { value: "", label: "Selecione…" },
                    ...addableFeats.map((feat) => ({
                      value: feat.slug,
                      label: feat.repeatable
                        ? `${feat.name} (repetível)`
                        : feat.name,
                    })),
                  ]}
                  value={addFeatSlug}
                  onChange={(e) => setAddFeatSlug(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={!addFeatSlug}
                onClick={handleAddFeat}
              >
                Adicionar
              </Button>
            </div>
          ) : null}
        </>
      )}
      {characterFeats.length > 0 ? (
        <div className="border-t border-border pt-4">
          <h3 className="mb-3 text-sm font-semibold">Opções dos talentos</h3>
          <FeatOptionsEditor
            characterFeats={characterFeats}
            featNameBySlug={featNameBySlug}
            value={featOptions}
            characterLevel={character.level}
            classSlug={character.classSlug}
            onChange={setFeatOptions}
          />
        </div>
      ) : null}
    </EditFormShell>
  );
}

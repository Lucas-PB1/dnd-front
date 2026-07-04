"use client";

import { useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";

import { ABILITY_LABELS_PT, abilityModifier } from "@/entities/character/types";
import { previewBackgroundAbilityBoosts } from "@/entities/character/lib/background-boost";
import { abilityModifierValue } from "@/entities/character";
import { ABILITY_KEYS } from "@/features/create-character/lib/point-buy";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import { useCharacterCatalogLabels } from "@/features/character-sheet/api/use-character-catalog-labels";
import type { CharacterDetail } from "@/entities/character/types";
import { useSpeciesTraitChoices } from "@/features/species-catalog/api/use-species";
import { useSubclassOptions } from "@/features/class-catalog/api/use-classes";
import {
  useBackgroundDetail,
  useBackgroundSkills,
  useBackgroundTools,
} from "@/features/background-catalog/api/use-backgrounds";
import { useFeatOptions } from "@/features/feat-catalog/api/use-feat-options";
import { isSubclassRequired } from "@/entities/character/lib/subclass";

type StepReviewProps = {
  control: Control<CreateCharacterInput>;
};

function previewCharacter(values: CreateCharacterInput): CharacterDetail {
  const plus2 = values.backgroundAbilityBoostPlus2Slug;
  const plus1 = values.backgroundAbilityBoostPlus1Slug;
  const finalScores =
    plus2 && plus1 && plus2 !== plus1
      ? previewBackgroundAbilityBoosts(
          values.abilityScores,
          plus2 as keyof typeof values.abilityScores,
          plus1 as keyof typeof values.abilityScores,
        )
      : values.abilityScores;

  return {
    id: "",
    name: values.name,
    level: values.level,
    classSlug: values.classSlug,
    speciesSlug: values.speciesSlug,
    backgroundSlug: values.backgroundSlug,
    subclassSlug: values.subclassSlug?.trim() ? values.subclassSlug : null,
    alignmentSlug: null,
    abilityScores: finalScores,
    hitPointsMax: null,
    hitPointsCurrent: null,
    proficiencyBonus: 0,
    classSkillSlugs: values.classSkillSlugs,
    backgroundSkillSlugs: [],
    speciesChoices: values.speciesChoices,
    subclassOptions: values.subclassOptions,
    featSlugs: [],
    featOptions: values.featOptions,
    characterSpells: values.characterSpells,
    equipment: values.equipment,
    languageSlugs: [],
    abilityGenerationMethodSlug: values.abilityGenerationMethodSlug,
    backgroundAbilityBoostPlus2Slug:
      values.backgroundAbilityBoostPlus2Slug ?? null,
    backgroundAbilityBoostPlus1Slug:
      values.backgroundAbilityBoostPlus1Slug ?? null,
    backgroundToolItemSlug: values.backgroundToolItemSlug?.trim()
      ? values.backgroundToolItemSlug.trim()
      : null,
    abilityModifiers: {
      forca: abilityModifierValue(finalScores.forca),
      destreza: abilityModifierValue(finalScores.destreza),
      constituicao: abilityModifierValue(finalScores.constituicao),
      inteligencia: abilityModifierValue(finalScores.inteligencia),
      sabedoria: abilityModifierValue(finalScores.sabedoria),
      carisma: abilityModifierValue(finalScores.carisma),
    },
    passivePerception: 10 + abilityModifierValue(finalScores.sabedoria),
    armorClass: 10 + abilityModifierValue(finalScores.destreza),
    armorClassNote: "Sem armadura",
    createdAt: "",
    updatedAt: "",
  };
}

export function StepReview({ control }: StepReviewProps) {
  const values = useWatch({ control }) as CreateCharacterInput;
  const plus2 = values.backgroundAbilityBoostPlus2Slug;
  const plus1 = values.backgroundAbilityBoostPlus1Slug;
  const labels = useCharacterCatalogLabels(previewCharacter(values));
  const speciesTraits = useSpeciesTraitChoices(
    values.speciesSlug,
    !!values.speciesSlug,
  );
  const subclassOpts = useSubclassOptions(
    values.subclassSlug ?? "",
    values.level,
    isSubclassRequired(values.level) && !!values.subclassSlug,
  );
  const backgroundDetail = useBackgroundDetail(
    values.backgroundSlug,
    !!values.backgroundSlug,
  );
  const backgroundSkills = useBackgroundSkills(
    values.backgroundSlug,
    !!values.backgroundSlug,
  );
  const needsToolChoice =
    backgroundDetail.data?.toolProficiencyKind === "choice";
  const backgroundTools = useBackgroundTools(
    values.backgroundSlug,
    needsToolChoice,
  );
  const originFeatSlug = backgroundDetail.data?.originFeatSlug ?? "";
  const originFeatOptionDefs = useFeatOptions(originFeatSlug, !!originFeatSlug);

  const toolLabel =
    backgroundDetail.data?.toolProficiencyKind === "fixed"
      ? (backgroundDetail.data.toolItemName ??
        backgroundDetail.data.toolItemSlug)
      : values.backgroundToolItemSlug
        ? (backgroundTools.data?.data.find(
            (t) => t.itemSlug === values.backgroundToolItemSlug,
          )?.itemName ?? values.backgroundToolItemSlug)
        : null;

  const identity = [
    labels.identity.speciesName,
    labels.identity.className,
    labels.identity.backgroundName,
    labels.identity.subclassName,
  ].filter(Boolean);

  function speciesChoiceLabel(kind: string, slug: string) {
    const row = speciesTraits.data?.data.find(
      (r) => r.choiceKind === kind && r.choiceSlug === slug,
    );
    return row?.choiceName ?? slug;
  }

  function subclassOptionLabel(optionKey: string, valueId: string) {
    const group = subclassOpts.data?.data.find(
      (g) => g.optionKey === optionKey,
    );
    const value = group?.values.find((v) => v.valueId === valueId);
    return value?.label ?? valueId;
  }

  function featOptionLabel(optionKey: string, valueId: string) {
    const group = originFeatOptionDefs.data?.data.find(
      (g) => g.optionKey === optionKey,
    );
    const value = group?.values.find((v) => v.valueId === valueId);
    return value?.label ?? valueId;
  }

  return (
    <div className="flex flex-col gap-6 text-sm">
      <section className="space-y-1">
        <h3 className="font-semibold">{values.name}</h3>
        <p className="text-muted-foreground">
          Nível {values.level}
          {identity.length > 0 ? ` · ${identity.join(" · ")}` : null}
        </p>
        <p className="text-muted-foreground">
          Método: {values.abilityGenerationMethodSlug}
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="font-semibold">Atributos</h3>
        {plus2 && plus1 && plus2 !== plus1 ? (
          <p className="text-muted-foreground">
            Antecedente: +2{" "}
            {ABILITY_LABELS_PT[plus2 as keyof typeof ABILITY_LABELS_PT]}, +1{" "}
            {ABILITY_LABELS_PT[plus1 as keyof typeof ABILITY_LABELS_PT]}
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ABILITY_KEYS.map((key) => {
            const score =
              plus2 && plus1 && plus2 !== plus1
                ? previewBackgroundAbilityBoosts(
                    values.abilityScores,
                    plus2 as keyof typeof values.abilityScores,
                    plus1 as keyof typeof values.abilityScores,
                  )[key]
                : values.abilityScores[key];
            return (
              <div
                key={key}
                className="rounded-md border border-border px-2 py-1.5 text-center"
              >
                <p className="text-xs text-muted-foreground">
                  {ABILITY_LABELS_PT[key]}
                </p>
                <p className="font-semibold">
                  {score}{" "}
                  <span className="font-mono text-muted-foreground">
                    ({abilityModifier(score)})
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {values.classSkillSlugs.length > 0 ? (
        <section className="space-y-2">
          <h3 className="font-semibold">Perícias de classe</h3>
          <ul className="flex flex-wrap gap-2">
            {values.classSkillSlugs.map((slug) => (
              <li
                key={slug}
                className="rounded-md border border-border px-2 py-1"
              >
                {labels.resolveSkill(slug)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {backgroundDetail.data ||
      (backgroundSkills.data?.data.length ?? 0) > 0 ? (
        <section className="space-y-2">
          <h3 className="font-semibold">Antecedente</h3>
          {backgroundDetail.data?.originFeatName ||
          backgroundDetail.data?.originFeatSlug ? (
            <p className="text-muted-foreground">
              Talento de origem:{" "}
              <span className="text-foreground">
                {backgroundDetail.data.originFeatName ??
                  backgroundDetail.data.originFeatSlug}
              </span>
            </p>
          ) : null}
          {values.featOptions.length > 0 ? (
            <ul className="text-sm text-muted-foreground">
              {values.featOptions.map((option) => (
                <li key={option.optionKey}>
                  {option.optionKey}:{" "}
                  <span className="text-foreground">
                    {featOptionLabel(option.optionKey, option.valueId)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {(backgroundSkills.data?.data.length ?? 0) > 0 ? (
            <p className="text-muted-foreground">
              Perícias:{" "}
              <span className="text-foreground">
                {backgroundSkills.data!.data.map((s) => s.name).join(", ")}
              </span>
            </p>
          ) : null}
          {toolLabel ? (
            <p className="text-muted-foreground">
              Ferramenta: <span className="text-foreground">{toolLabel}</span>
            </p>
          ) : null}
        </section>
      ) : null}

      {values.speciesChoices.length > 0 ? (
        <section className="space-y-2">
          <h3 className="font-semibold">Traços de espécie</h3>
          <ul className="flex flex-wrap gap-2">
            {values.speciesChoices.map((c) => (
              <li
                key={`${c.choiceKind}-${c.choiceSlug}`}
                className="rounded-md border border-border px-2 py-1"
              >
                {speciesChoiceLabel(c.choiceKind, c.choiceSlug)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {values.subclassOptions.length > 0 ? (
        <section className="space-y-2">
          <h3 className="font-semibold">Opções de subclasse</h3>
          <ul className="flex flex-wrap gap-2">
            {values.subclassOptions.map((o) => (
              <li
                key={o.optionKey}
                className="rounded-md border border-border px-2 py-1"
              >
                {subclassOptionLabel(o.optionKey, o.valueId)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {values.equipment.length > 0 ? (
        <section className="space-y-2">
          <h3 className="font-semibold">Equipamento inicial</h3>
          <ul className="flex flex-col gap-1 text-muted-foreground">
            {values.equipment.map((item, i) => (
              <li
                key={`${item.source}-${item.packageSlug}-${item.itemSlug ?? i}`}
              >
                {item.source === "class" ? "Classe" : "Antecedente"} — pacote{" "}
                {item.packageSlug}
                {item.itemSlug ? ` · ${item.itemSlug}` : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {values.characterSpells.length > 0 ? (
        <section className="space-y-2">
          <h3 className="font-semibold">Magias</h3>
          <ul className="flex flex-wrap gap-2">
            {values.characterSpells.map((s) => (
              <li
                key={`${s.spellSlug}-${s.listType}`}
                className="rounded-md border border-border px-2 py-1"
              >
                {labels.resolveSpell(s.spellSlug)}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({s.listType})
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

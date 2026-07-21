"use client";

import { useEffect, useMemo } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import {
  canAddCharacterFeat,
  featInstanceKey,
} from "@/entities/character/lib/character-feat";
import type { FeatOption } from "@/entities/character/sheet-types";
import { useBackgroundDetail } from "@/features/background-catalog/api/use-backgrounds";
import { useClassDetail } from "@/features/class-catalog/api/use-classes";
import {
  asiFeatLevelsUpTo,
  countAsiFeatSlots,
} from "@/features/create-character/lib/asi-feat-slots";
import { asiFeatSlotsToCharacterFeats } from "@/features/create-character/lib/asi-feat-slots-to-feats";
import {
  previewCreateCharacterFeats,
  resolveCreateCharacterFeats,
} from "@/features/create-character/lib/preview-create-character-feats";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import { WizardFormSection } from "@/features/create-character/ui/wizard-form-section";
import {
  FIGHTING_STYLE_FEAT_CATEGORY,
  collectTakenFightingStyleSlugs,
} from "@/features/feat-catalog/lib/fighting-style-feat-options";
import { FeatOptionsEditor } from "@/features/feat-catalog/ui/feat-options-editor";
import { useFeats } from "@/features/reference-catalog/api/use-reference";

type StepFeatsProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
  error?: string;
};

function pruneFeatOptions(
  previewFeats: ReturnType<typeof previewCreateCharacterFeats>,
  featOptions: FeatOption[],
): FeatOption[] {
  const validKeys = new Set(
    previewFeats.map((feat) =>
      featInstanceKey(feat.featSlug, feat.instanceIndex),
    ),
  );
  return featOptions.filter((option) =>
    validKeys.has(featInstanceKey(option.featSlug, option.instanceIndex)),
  );
}

export function StepFeats({ control, setValue, error }: StepFeatsProps) {
  const level = useWatch({ control, name: "level", defaultValue: 1 });
  const classSlug = useWatch({
    control,
    name: "classSlug",
    defaultValue: "",
  });
  const backgroundSlug = useWatch({
    control,
    name: "backgroundSlug",
    defaultValue: "",
  });
  const asiFeatSlotSlugs = useWatch({
    control,
    name: "asiFeatSlotSlugs",
    defaultValue: [],
  });
  const featOptions = useWatch({
    control,
    name: "featOptions",
    defaultValue: [],
  });
  const speciesChoices = useWatch({
    control,
    name: "speciesChoices",
    defaultValue: [],
  });
  const subclassOptions = useWatch({
    control,
    name: "subclassOptions",
    defaultValue: [],
  });

  const ASI_FEAT_SLUG = "ability-score-improvement";
  const feats = useFeats();
  const classDetail = useClassDetail(classSlug, !!classSlug);
  const backgroundDetail = useBackgroundDetail(
    backgroundSlug,
    !!backgroundSlug,
  );
  const originFeatSlug = backgroundDetail.data?.originFeatSlug ?? null;
  const originFeatName = backgroundDetail.data?.originFeatName ?? null;

  const asiSlotCount = countAsiFeatSlots(level);
  const asiLevels = asiFeatLevelsUpTo(level);

  const featNameBySlug = useMemo(
    () =>
      Object.fromEntries(
        (feats.data?.data ?? []).map((feat) => [feat.slug, feat.name]),
      ),
    [feats.data?.data],
  );

  const asiFeats = useMemo(
    () => asiFeatSlotsToCharacterFeats(asiFeatSlotSlugs),
    [asiFeatSlotSlugs],
  );
  const previewFeats = useMemo(
    () => resolveCreateCharacterFeats(originFeatSlug, asiFeats, speciesChoices),
    [originFeatSlug, asiFeats, speciesChoices],
  );

  useEffect(() => {
    if (asiFeatSlotSlugs.length < asiSlotCount) {
      const next = [...asiFeatSlotSlugs];
      while (next.length < asiSlotCount) next.push("");
      setValue("asiFeatSlotSlugs", next);
    }
  }, [asiSlotCount, asiFeatSlotSlugs.length, setValue, asiFeatSlotSlugs]);

  function updateAsiSlot(index: number, slug: string) {
    const nextSlots = [...asiFeatSlotSlugs];
    while (nextSlots.length < asiSlotCount) nextSlots.push("");
    nextSlots[index] = slug;
    setValue("asiFeatSlotSlugs", nextSlots);

    const nextPreview = resolveCreateCharacterFeats(
      originFeatSlug,
      asiFeatSlotsToCharacterFeats(nextSlots),
      speciesChoices,
    );
    setValue("featOptions", pruneFeatOptions(nextPreview, featOptions));
  }

  const fightingStyleFeatSlugs = useMemo(() => {
    return new Set(
      (feats.data?.data ?? [])
        .filter((feat) => feat.categorySlug === FIGHTING_STYLE_FEAT_CATEGORY)
        .map((feat) => feat.slug),
    );
  }, [feats.data?.data]);

  function slotFeatOptions(slotIndex: number) {
    const otherSlots = asiFeatSlotSlugs.map((slug, index) =>
      index === slotIndex ? "" : slug,
    );
    const otherFeats = asiFeatSlotsToCharacterFeats(otherSlots);
    const previewWithoutSlot = resolveCreateCharacterFeats(
      originFeatSlug,
      otherFeats,
      speciesChoices,
    );
    const currentSlotSlug = asiFeatSlotSlugs[slotIndex] ?? "";
    const takenStyles = collectTakenFightingStyleSlugs({
      characterFeatSlugs: previewWithoutSlot.map((feat) => feat.featSlug),
      fightingStyleFeatSlugs: fightingStyleFeatSlugs,
      subclassOptions,
    });
    const allowedStyles = new Set(classDetail.data?.fightingStyleSlugs ?? []);

    return (feats.data?.data ?? []).filter((feat) => {
      if (
        !canAddCharacterFeat(previewWithoutSlot, feat.slug, feat.repeatable)
      ) {
        return false;
      }
      if (feat.categorySlug !== FIGHTING_STYLE_FEAT_CATEGORY) {
        return true;
      }
      if (feat.slug === currentSlotSlug) {
        return allowedStyles.has(feat.slug);
      }
      return allowedStyles.has(feat.slug) && !takenStyles.includes(feat.slug);
    });
  }

  function sortedSlotFeatOptions(slotIndex: number) {
    const list = slotFeatOptions(slotIndex);
    const asiFeat = list.find((f) => f.slug === ASI_FEAT_SLUG);
    const rest = list
      .filter((f) => f.slug !== ASI_FEAT_SLUG)
      .sort((a, b) => a.name.localeCompare(b.name, "pt"));
    return asiFeat ? [asiFeat, ...rest] : rest;
  }

  if (!backgroundSlug) {
    return (
      <p className="text-sm text-muted-foreground">
        Escolha um antecedente na etapa Identidade.
      </p>
    );
  }

  if (backgroundDetail.isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando antecedente…</p>
    );
  }

  const showOriginSection = !!originFeatSlug;
  const showAsiSection = asiSlotCount > 0;

  if (!showOriginSection && !showAsiSection) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum talento para configurar neste nível.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {showAsiSection ? (
        <WizardFormSection title="ASI / talentos" compact>
          {feats.isPending ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : (
            <div
              className={cnAsiGrid(asiLevels.length)}
            >
              {asiLevels.map((asiLevel, index) => (
                <CatalogSelect
                  key={asiLevel}
                  id={`asi-feat-slot-${asiLevel}`}
                  label={`Nv. ${asiLevel}`}
                  options={[
                    {
                      value: "",
                      label: "Melhoria manual",
                    },
                    ...sortedSlotFeatOptions(index).map((feat) => ({
                      value: feat.slug,
                      label:
                        feat.slug === ASI_FEAT_SLUG
                          ? `${feat.name} (+2/+1)`
                          : feat.repeatable
                            ? `${feat.name} (rep.)`
                            : feat.name,
                    })),
                  ]}
                  value={asiFeatSlotSlugs[index] ?? ""}
                  onChange={(e) => updateAsiSlot(index, e.target.value)}
                />
              ))}
            </div>
          )}
        </WizardFormSection>
      ) : null}

      {showOriginSection ? (
        <WizardFormSection title="Origem" compact>
          <p className="text-sm">
            <span className="font-medium">
              {originFeatName ?? originFeatSlug}
            </span>
            <span className="text-muted-foreground">
              {" "}
              · {backgroundDetail.data?.name}
            </span>
          </p>
        </WizardFormSection>
      ) : null}

      {previewFeats.length > 0 ? (
        <WizardFormSection title="Opções" compact>
          <FeatOptionsEditor
            characterFeats={previewFeats}
            featNameBySlug={featNameBySlug}
            value={featOptions}
            characterLevel={level}
            classSlug={classSlug}
            onChange={(next: FeatOption[]) => setValue("featOptions", next)}
          />
        </WizardFormSection>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function cnAsiGrid(count: number) {
  if (count <= 1) return "grid gap-4";
  if (count === 2) return "grid gap-4 sm:grid-cols-2";
  return "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
}

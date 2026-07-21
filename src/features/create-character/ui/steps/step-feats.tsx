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
import { previewCreateCharacterFeats } from "@/features/create-character/lib/preview-create-character-feats";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
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
  const subclassOptions = useWatch({
    control,
    name: "subclassOptions",
    defaultValue: [],
  });

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
    () => previewCreateCharacterFeats(originFeatSlug, asiFeats),
    [originFeatSlug, asiFeats],
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

    const nextPreview = previewCreateCharacterFeats(
      originFeatSlug,
      asiFeatSlotsToCharacterFeats(nextSlots),
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
    const previewWithoutSlot = previewCreateCharacterFeats(
      originFeatSlug,
      otherFeats,
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
      return (
        allowedStyles.has(feat.slug) && !takenStyles.includes(feat.slug)
      );
    });
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
    <div className="space-y-6">
      {showAsiSection ? (
        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold">Marcos ASI / talento</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Nos níveis {asiLevels.join(", ")}, escolha um talento na lista
              (inclui Aumento no Valor de Atributo com +2/+1) ou deixe em branco
              se já aplicou a melhoria manualmente na etapa Atributos.
            </p>
          </div>
          {feats.isPending ? (
            <p className="text-sm text-muted-foreground">
              Carregando talentos…
            </p>
          ) : (
            <div className="space-y-3">
              {asiLevels.map((asiLevel, index) => (
                <CatalogSelect
                  key={asiLevel}
                  id={`asi-feat-slot-${asiLevel}`}
                  label={`Marco nível ${asiLevel}`}
                  options={[
                    { value: "", label: "Melhoria de atributos (+2/+1)" },
                    ...slotFeatOptions(index).map((feat) => ({
                      value: feat.slug,
                      label: feat.repeatable
                        ? `${feat.name} (repetível)`
                        : feat.name,
                    })),
                  ]}
                  value={asiFeatSlotSlugs[index] ?? ""}
                  onChange={(e) => updateAsiSlot(index, e.target.value)}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {showOriginSection ? (
        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold">Talento de origem</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Concedido pelo antecedente{" "}
              <span className="font-medium text-foreground">
                {backgroundDetail.data?.name}
              </span>
              . A API inclui{" "}
              <span className="font-medium text-foreground">
                {originFeatName ?? originFeatSlug}
              </span>{" "}
              automaticamente na ficha.
            </p>
          </div>
        </section>
      ) : null}

      {previewFeats.length > 0 ? (
        <section className="space-y-3 border-t border-border pt-4">
          <h3 className="text-sm font-semibold">Opções dos talentos</h3>
          <FeatOptionsEditor
            characterFeats={previewFeats}
            featNameBySlug={featNameBySlug}
            value={featOptions}
            characterLevel={level}
            classSlug={classSlug}
            onChange={(next: FeatOption[]) => setValue("featOptions", next)}
          />
        </section>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

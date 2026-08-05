"use client";

import { useMemo } from "react";

import {
  featInstanceKey,
  formatCharacterFeatLabel,
} from "@/entities/character/lib/character-feat";
import { useFeatDetails } from "@/features/catalog/feat-catalog/api/use-feat-details";
import { useFeatOptionLabels } from "@/features/catalog/feat-catalog/api/use-feat-option-labels";
import { FeatBenefits } from "@/features/catalog/feat-catalog/ui/catalog/feat-benefits";
import { FeatOptionsReadList } from "@/features/catalog/feat-catalog/ui/options/feat-options-read-list";
import {
  DetailTileGrid,
  type DetailTileItem,
} from "@/features/character/character-sheet/ui/sections/detail-tile-grid";
import type { SheetReadSectionProps } from "@/features/character/character-sheet/ui/sections/sheet-section-types";

export function FeatsSection({ character, labels }: SheetReadSectionProps) {
  const featDetailSlugs = character.characterFeats.map((feat) => feat.featSlug);
  const { featBySlug, isLoading: featDetailsLoading } =
    useFeatDetails(featDetailSlugs);
  const {
    resolveFeatOption,
    featOptionDefsFor,
    isLoading: featOptionsLoading,
  } = useFeatOptionLabels({
    characterFeats: character.characterFeats,
    labelContext: {
      resolveSpell: labels.resolveSpell,
      resolveSkill: labels.resolveSkill,
    },
  });

  const optionsByInstance = useMemo(
    () =>
      character.featOptions.reduce<
        Record<string, typeof character.featOptions>
      >((acc, option) => {
        const key = featInstanceKey(option.featSlug, option.instanceIndex);
        const list = acc[key] ?? [];
        list.push(option);
        acc[key] = list;
        return acc;
      }, {}),
    [character.featOptions],
  );

  const items = useMemo((): DetailTileItem[] => {
    return character.characterFeats.map((feat) => {
      const key = featInstanceKey(feat.featSlug, feat.instanceIndex);
      const options = optionsByInstance[key] ?? [];
      const detail = featBySlug[feat.featSlug];
      const title = formatCharacterFeatLabel(
        feat,
        { [feat.featSlug]: labels.resolveFeat(feat.featSlug) },
        character.characterFeats,
      );
      return {
        id: key,
        title,
        subtitle: detail?.categoryName
          ? detail.categoryName
          : options.length > 0
            ? `${options.length} escolha${options.length > 1 ? "s" : ""}`
            : undefined,
        body: featDetailsLoading ? (
          <p className="text-sm text-muted-foreground">
            Carregando descrição…
          </p>
        ) : (
          <div className="space-y-3">
            <FeatBenefits
              benefits={detail?.benefits ?? []}
              prerequisite={detail?.prerequisite}
            />
            {options.length > 0 ? (
              <FeatOptionsReadList
                options={options}
                defs={featOptionDefsFor(feat.featSlug)}
                resolveFeatOption={resolveFeatOption}
                loading={featOptionsLoading}
              />
            ) : null}
          </div>
        ),
      };
    });
  }, [
    character.characterFeats,
    featBySlug,
    featDetailsLoading,
    featOptionDefsFor,
    featOptionsLoading,
    labels,
    optionsByInstance,
    resolveFeatOption,
  ]);

  if (character.characterFeats.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum talento registrado.
      </p>
    );
  }

  return (
    <DetailTileGrid
      items={items}
      hint="Toque em um talento para ler o texto."
    />
  );
}

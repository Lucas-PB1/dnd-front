"use client";

import {
  featInstanceKey,
  formatCharacterFeatLabel,
} from "@/entities/character/lib/character-feat";
import { useFeatDetails } from "@/features/feat-catalog/api/use-feat-details";
import { useFeatOptionLabels } from "@/features/feat-catalog/api/use-feat-option-labels";
import { FeatBenefits } from "@/features/feat-catalog/ui/catalog/feat-benefits";
import { FeatOptionsReadList } from "@/features/feat-catalog/ui/options/feat-options-read-list";
import type { SheetReadSectionProps } from "@/features/character-sheet/ui/sections/sheet-section-types";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";

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

  if (character.characterFeats.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum talento registrado.
      </p>
    );
  }

  const optionsByInstance = character.featOptions.reduce<
    Record<string, typeof character.featOptions>
  >((acc, option) => {
    const key = featInstanceKey(option.featSlug, option.instanceIndex);
    const list = acc[key] ?? [];
    list.push(option);
    acc[key] = list;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Toque em um talento para ler o texto.
      </p>
      <ul className="space-y-1.5">
        {character.characterFeats.map((feat) => {
          const key = featInstanceKey(feat.featSlug, feat.instanceIndex);
          const options = optionsByInstance[key] ?? [];
          const detail = featBySlug[feat.featSlug];
          const title = formatCharacterFeatLabel(
            feat,
            { [feat.featSlug]: labels.resolveFeat(feat.featSlug) },
            character.characterFeats,
          );
          return (
            <li key={key}>
              <CollapsibleCard
                title={title}
                subtitle={
                  detail?.categoryName
                    ? detail.categoryName
                    : options.length > 0
                      ? `${options.length} escolha${options.length > 1 ? "s" : ""}`
                      : undefined
                }
                size="compact"
                defaultOpen={false}
                className="bg-background/50"
              >
                {featDetailsLoading ? (
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
                )}
              </CollapsibleCard>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

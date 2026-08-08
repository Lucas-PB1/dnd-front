"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import type {
  CharacterFeat,
  FeatOption,
} from "@/entities/character/sheet-types";
import type { FeatOptionDefinition } from "@/entities/feat/types";
import {
  featKeys,
  fetchFeatOptionsBySlugs,
} from "@/features/catalog/feat-catalog/api/feats.api";
import {
  resolveFeatOptionDisplay,
  type FeatOptionLabelContext,
} from "@/features/catalog/feat-catalog/lib/resolve-feat-option-label";
import { useItems } from "@/features/catalog/item-catalog/api/use-items";
import { useAbilityLabels } from "@/features/catalog/reference-catalog/api/use-ability-labels";
import { useFeatLabels } from "@/features/catalog/reference-catalog/api/use-reference";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";

type UseFeatOptionLabelsInput = {
  characterFeats: CharacterFeat[];
  labelContext: FeatOptionLabelContext;
};

export function useFeatOptionLabels({
  characterFeats,
  labelContext,
}: UseFeatOptionLabelsInput) {
  const { labelOf } = useAbilityLabels();
  const slugs = useMemo(
    () => [...new Set(characterFeats.map((feat) => feat.featSlug))],
    [characterFeats],
  );

  const optionsQuery = useQuery({
    queryKey: featKeys.optionsBySlugs(slugs),
    queryFn: () => fetchFeatOptionsBySlugs(slugs),
    staleTime: CATALOG_DETAIL_STALE_MS,
    enabled: slugs.length > 0,
  });

  const tools = useItems({ itemType: "tool", limit: 200, fields: "summary" });
  const featsCatalog = useFeatLabels();

  const featLabels = useMemo(
    () =>
      Object.fromEntries(
        (featsCatalog.data?.data ?? []).map((feat) => [feat.slug, feat.name]),
      ),
    [featsCatalog.data?.data],
  );

  const defsBySlug = useMemo(() => {
    const map: Record<string, FeatOptionDefinition[]> = {};
    for (const row of optionsQuery.data ?? []) {
      map[row.featSlug] = row.options;
    }
    return map;
  }, [optionsQuery.data]);

  const itemLabels = useMemo(
    () =>
      Object.fromEntries(
        (tools.data?.data ?? []).map((item) => [item.slug, item.name]),
      ),
    [tools.data?.data],
  );

  const context = useMemo<FeatOptionLabelContext>(
    () => ({
      resolveSpell: labelContext.resolveSpell,
      resolveSkill: labelContext.resolveSkill,
      resolveItem: (slug) => itemLabels[slug] ?? slug,
      resolveAbility: (slug) => labelOf(slug),
      resolveFeat: (slug) => featLabels[slug] ?? slug,
    }),
    [labelContext, itemLabels, featLabels, labelOf],
  );

  const resolveFeatOption = useCallback(
    (option: FeatOption) =>
      resolveFeatOptionDisplay(
        defsBySlug[option.featSlug] ?? [],
        option.optionKey,
        option.valueId,
        context,
      ),
    [defsBySlug, context],
  );

  const isLoading =
    (slugs.length > 0 && optionsQuery.isPending) ||
    tools.isPending ||
    featsCatalog.isPending;

  const featOptionDefsFor = useCallback(
    (featSlug: string) => defsBySlug[featSlug] ?? [],
    [defsBySlug],
  );

  return { resolveFeatOption, featOptionDefsFor, isLoading };
}

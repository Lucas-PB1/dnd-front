"use client";

import { useQueries } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import type {
  CharacterFeat,
  FeatOption,
} from "@/entities/character/sheet-types";
import type { FeatOptionDefinition } from "@/entities/feat/types";
import {
  featKeys,
  fetchFeatOptions,
} from "@/features/feat-catalog/api/feats.api";
import {
  resolveFeatOptionDisplay,
  type FeatOptionLabelContext,
} from "@/features/feat-catalog/lib/resolve-feat-option-label";
import { useItems } from "@/features/item-catalog/api/use-items";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";

type UseFeatOptionLabelsInput = {
  characterFeats: CharacterFeat[];
  labelContext: FeatOptionLabelContext;
};

export function useFeatOptionLabels({
  characterFeats,
  labelContext,
}: UseFeatOptionLabelsInput) {
  const slugs = useMemo(
    () => [...new Set(characterFeats.map((feat) => feat.featSlug))],
    [characterFeats],
  );

  const optionQueries = useQueries({
    queries: slugs.map((slug) => ({
      queryKey: featKeys.options(slug),
      queryFn: () => fetchFeatOptions(slug),
      staleTime: CATALOG_DETAIL_STALE_MS,
      enabled: !!slug,
    })),
  });

  const tools = useItems({ itemType: "tool", limit: 200 });

  const defsBySlug = useMemo(() => {
    const map: Record<string, FeatOptionDefinition[]> = {};
    slugs.forEach((slug, index) => {
      map[slug] = optionQueries[index]?.data?.data ?? [];
    });
    return map;
  }, [slugs, optionQueries]);

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
    }),
    [labelContext, itemLabels],
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
    optionQueries.some((query) => query.isPending) || tools.isPending;

  return { resolveFeatOption, isLoading };
}

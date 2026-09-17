"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

import type { EconomyActionOwner } from "@/entities/combat-mechanical/lib/filter-economy-actions-by-owner";
import {
  filterEconomyActionsByOwner,
  sortEconomyActionsForCatalog,
} from "@/entities/combat-mechanical/lib/filter-economy-actions-by-owner";
import type {
  ClassEconomyActionRecord,
  ClassPanelActionRecord,
} from "@/entities/combat-mechanical/types";
import {
  combatMechanicalCatalogQueryOptions,
  useCombatMechanicalCatalog,
} from "@/features/catalog/reference-catalog/api/use-reference";
import { CatalogMechanicalSection } from "@/features/catalog/shared/ui/catalog-mechanical-section";

type Props = EconomyActionOwner & {
  classSlugForQuery?: string;
};

function ownerFromProps(props: Props): EconomyActionOwner {
  if ("classSlug" in props) return { classSlug: props.classSlug };
  if ("subclassSlug" in props) return { subclassSlug: props.subclassSlug };
  if ("featSlug" in props) return { featSlug: props.featSlug };
  if ("itemSlug" in props) return { itemSlug: props.itemSlug };
  if ("speciesSlug" in props) return { speciesSlug: props.speciesSlug };
  if ("threadSlug" in props) return { threadSlug: props.threadSlug };
  return { heritageTraitSlugs: props.heritageTraitSlugs };
}

function filterPanelActions(
  actions: readonly ClassPanelActionRecord[],
  owner: EconomyActionOwner,
): ClassPanelActionRecord[] {
  if ("classSlug" in owner) {
    return actions.filter((action) => action.classSlug === owner.classSlug);
  }
  if ("subclassSlug" in owner) {
    return actions.filter(
      (action) => action.subclassSlug === owner.subclassSlug,
    );
  }
  return [];
}

function mergeEconomyActions(
  groups: readonly (readonly ClassEconomyActionRecord[] | undefined)[],
): ClassEconomyActionRecord[] {
  const byId = new Map<string, ClassEconomyActionRecord>();
  for (const group of groups) {
    for (const action of group ?? []) {
      byId.set(action.id, action);
    }
  }
  return [...byId.values()];
}

export function CatalogOwnerMechanicalSection(props: Props) {
  const owner = ownerFromProps(props);
  const queryClassSlug =
    "classSlug" in owner ? owner.classSlug : props.classSlugForQuery;
  const querySubclassSlug =
    "subclassSlug" in owner ? owner.subclassSlug : undefined;
  const queryFeatSlug = "featSlug" in owner ? owner.featSlug : undefined;
  const queryItemSlug = "itemSlug" in owner ? owner.itemSlug : undefined;
  const querySpeciesSlug =
    "speciesSlug" in owner ? owner.speciesSlug : undefined;
  const queryThreadSlug = "threadSlug" in owner ? owner.threadSlug : undefined;
  const heritageTraitSlugs =
    "heritageTraitSlugs" in owner ? owner.heritageTraitSlugs : undefined;
  const queryHeritageTraitSlug =
    heritageTraitSlugs?.length === 1 ? heritageTraitSlugs[0] : undefined;
  const heritageReady =
    heritageTraitSlugs == null || heritageTraitSlugs.length > 0;
  const fetchPerHeritageTrait = (heritageTraitSlugs?.length ?? 0) > 1;

  const heritageTraitKey = heritageTraitSlugs?.join("\0") ?? "";
  const catalog = useCombatMechanicalCatalog({
    classSlug: queryClassSlug,
    subclassSlug: querySubclassSlug,
    featSlug: queryFeatSlug,
    itemSlug: queryItemSlug,
    speciesSlug: querySpeciesSlug,
    threadSlug: queryThreadSlug,
    heritageTraitSlug: queryHeritageTraitSlug,
    enabled: heritageReady && !fetchPerHeritageTrait,
  });

  const heritageTraitQueries = useQueries({
    queries: fetchPerHeritageTrait
      ? (heritageTraitSlugs ?? []).map((heritageTraitSlug) =>
          combatMechanicalCatalogQueryOptions({
            heritageTraitSlug,
            enabled: heritageReady,
          }),
        )
      : [],
  });

  const economySource = fetchPerHeritageTrait
    ? mergeEconomyActions(
        heritageTraitQueries.map((query) => query.data?.economyActions),
      )
    : (catalog.data?.economyActions ?? []);

  const economyActions = useMemo(
    () =>
      sortEconomyActionsForCatalog(
        filterEconomyActionsByOwner(economySource, owner),
      ),
    [
      economySource,
      queryClassSlug,
      querySubclassSlug,
      queryFeatSlug,
      queryItemSlug,
      querySpeciesSlug,
      queryThreadSlug,
      heritageTraitKey,
    ],
  );

  const panelActions = useMemo(
    () => filterPanelActions(catalog.data?.panelActions ?? [], owner),
    [catalog.data?.panelActions, queryClassSlug, querySubclassSlug],
  );

  const isPending = fetchPerHeritageTrait
    ? heritageReady && heritageTraitQueries.some((query) => query.isPending)
    : heritageReady && catalog.isPending;
  const isError = fetchPerHeritageTrait
    ? heritageTraitQueries.some((query) => query.isError)
    : catalog.isError;

  return (
    <CatalogMechanicalSection
      economyActions={economyActions}
      panelActions={panelActions}
      isPending={isPending}
      isError={isError}
    />
  );
}

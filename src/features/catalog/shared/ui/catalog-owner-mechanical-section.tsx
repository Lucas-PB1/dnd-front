"use client";

import { useMemo } from "react";

import type { EconomyActionOwner } from "@/entities/combat-mechanical/lib/filter-economy-actions-by-owner";
import {
  filterEconomyActionsByOwner,
  sortEconomyActionsForCatalog,
} from "@/entities/combat-mechanical/lib/filter-economy-actions-by-owner";
import type { ClassPanelActionRecord } from "@/entities/combat-mechanical/types";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
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

  const catalog = useCombatMechanicalCatalog({
    classSlug: queryClassSlug,
    subclassSlug: querySubclassSlug,
    featSlug: queryFeatSlug,
    itemSlug: queryItemSlug,
    speciesSlug: querySpeciesSlug,
    threadSlug: queryThreadSlug,
    heritageTraitSlug: queryHeritageTraitSlug,
    enabled: heritageReady,
  });

  const economyActions = useMemo(
    () =>
      sortEconomyActionsForCatalog(
        filterEconomyActionsByOwner(
          catalog.data?.economyActions ?? [],
          owner,
        ),
      ),
    [catalog.data?.economyActions, owner],
  );

  const panelActions = useMemo(
    () => filterPanelActions(catalog.data?.panelActions ?? [], owner),
    [catalog.data?.panelActions, owner],
  );

  return (
    <CatalogMechanicalSection
      economyActions={economyActions}
      panelActions={panelActions}
      isPending={heritageReady && catalog.isPending}
      isError={catalog.isError}
    />
  );
}

/**
 * Resolução de features de classe/espécie/talento/item com economia de ação (turno).
 * Fonte: `GET /combat-mechanical-catalog` → `economyActions`.
 */

import type {
  ActionEconomyBucket,
  ClassEconomyActionRecord,
} from "@/entities/combat-mechanical/types";
import type { EconomyTableAction } from "@/features/character/character-sheet/lib/combat/economy-table-actions";

export type { ActionEconomyBucket };

export type ClassEconomyAction = {
  id: string;
  name: string;
  economy: ActionEconomyBucket;
  classSlug?: string | null;
  speciesSlug?: string | null;
  featSlug?: string | null;
  itemSlug?: string | null;
  heritageTraitSlug?: string | null;
  minTraitTakes?: number;
  minLevel: number;
  /** Se definido, só aparece com essa subclasse. */
  subclassSlug?: string;
  requiresOptionKey?: string;
  requiresOptionValue?: string;
  /** Pool principal (ex.: psi-energy-dice, secondWind). */
  resourceSlug?: string;
  /** Tracker 0/1 de uso gratuito por descanso (ex.: telekinetic-movement). */
  freeResourceSlug?: string;
  /** Sempre gasta o pool (sem uso gratuito). */
  alwaysSpendsResource?: boolean;
  /** Resumo de uma linha na lista. */
  summary?: string;
  /** Texto maior para o modal de detalhe (fallback: summary). */
  description?: string;
  /** Se definido, a aba Ações mostra Usar com efeito de mesa. */
  tableAction?: EconomyTableAction;
  /** Quantidade gasta por Usar quando tableAction é spend-resource (padrão 1). */
  spendAmount?: number;
  /** Magia vinculada — Usar conjura via motor de cast. */
  spellSlug?: string;
};

export type ResolveClassEconomyInput = {
  classSlug: string;
  level: number;
  subclassSlug?: string | null;
  speciesSlug?: string | null;
  /** Escolhas de espécie (choiceKind / choiceSlug). */
  speciesChoices?: readonly { choiceKind: string; choiceSlug: string }[];
  /** Escolhas de herança GH (choiceKind / choiceSlug). */
  heritageChoices?: readonly { choiceKind: string; choiceSlug: string }[];
  /** Slugs de talentos na ficha (inclui estilos de luta como feat). */
  featSlugs?: readonly string[];
  /** Itens ativos (equipado + sintonizado) e charms anexados. */
  activeItemSlugs?: readonly string[];
};

/** option_key do catálogo → choiceKind na ficha. */
const OPTION_KEY_TO_CHOICE_KIND: Record<string, string> = {
  giantAncestryId: "giant_ancestry",
  constructionId: "geppettin_construction",
  dragonAncestryId: "dragon_ancestry",
  lineageId: "elf_lineage",
  gnomeLineageId: "gnome_lineage",
  infernalLegacyId: "infernal_legacy",
  serviceModelId: "manikin_service_model",
  armorPresetId: "manikin_armor",
  monstrousLineageId: "scourgeborne_lineage",
  madnessId: "scourgeborne_madness",
  bearfolkLineageId: "bearfolk_lineage",
  naturalAdaptationId: "beastkin_adaptation",
  giantkinAncestryId: "giantkin_ancestry",
  trollkinAncestryId: "trollkin_ancestry",
  dwarfCultureId: "dwarf_culture",
};

const ECONOMY_BUCKETS = new Set<ActionEconomyBucket>([
  "action",
  "bonus",
  "reaction",
  "free",
]);

function asEconomyBucket(value: string): ActionEconomyBucket {
  return ECONOMY_BUCKETS.has(value as ActionEconomyBucket)
    ? (value as ActionEconomyBucket)
    : "free";
}

export function mapEconomyActionRecord(
  record: ClassEconomyActionRecord,
): ClassEconomyAction {
  return {
    id: record.id,
    name: record.name,
    economy: asEconomyBucket(String(record.economy)),
    classSlug: record.classSlug,
    speciesSlug: record.speciesSlug,
    featSlug: record.featSlug,
    itemSlug: record.itemSlug,
    heritageTraitSlug: record.heritageTraitSlug,
    minTraitTakes: record.minTraitTakes,
    minLevel: record.minLevel,
    subclassSlug: record.subclassSlug,
    requiresOptionKey: record.requiresOptionKey,
    requiresOptionValue: record.requiresOptionValue,
    resourceSlug: record.resourceSlug,
    freeResourceSlug: record.freeResourceSlug,
    alwaysSpendsResource: record.alwaysSpendsResource,
    summary: record.summary,
    description: record.description,
    tableAction: record.tableAction,
    spendAmount: record.spendAmount,
    spellSlug: record.spellSlug,
  };
}

function choiceSlugForOptionKey(
  optionKey: string,
  speciesChoices: readonly { choiceKind: string; choiceSlug: string }[],
): string | null {
  const choiceKind =
    OPTION_KEY_TO_CHOICE_KIND[optionKey] ?? optionKey;
  const found = speciesChoices.find(
    (choice) => choice.choiceKind === choiceKind,
  )?.choiceSlug;
  return found ?? null;
}

function matchesSpeciesOption(
  action: ClassEconomyActionRecord,
  speciesChoices: readonly { choiceKind: string; choiceSlug: string }[],
): boolean {
  if (!action.requiresOptionKey || !action.requiresOptionValue) return true;
  return (
    choiceSlugForOptionKey(action.requiresOptionKey, speciesChoices) ===
    action.requiresOptionValue
  );
}

function heritageTraitTakeCounts(
  heritageChoices: readonly { choiceKind: string; choiceSlug: string }[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const choice of heritageChoices) {
    if (!choice.choiceKind.startsWith("heritage_trait_")) continue;
    const slug = choice.choiceSlug?.trim();
    if (!slug) continue;
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return counts;
}

function matchesHeritageTraitAction(
  action: ClassEconomyActionRecord,
  heritageChoices: readonly { choiceKind: string; choiceSlug: string }[],
): boolean {
  if (!action.heritageTraitSlug) return false;
  const takes = heritageTraitTakeCounts(heritageChoices);
  const have = takes.get(action.heritageTraitSlug) ?? 0;
  const need = action.minTraitTakes ?? 1;
  return have >= need;
}

export function resolveClassEconomyActions(
  catalog: readonly ClassEconomyActionRecord[],
  input: ResolveClassEconomyInput,
): ClassEconomyAction[] {
  const subclass = input.subclassSlug ?? null;
  const species = input.speciesSlug ?? null;
  const choices = input.speciesChoices ?? [];
  const heritageChoices = input.heritageChoices ?? [];
  const featSlugs = new Set(input.featSlugs ?? []);
  const activeItemSlugs = new Set(input.activeItemSlugs ?? []);

  return catalog
    .filter((action) => {
      if (input.level < action.minLevel) return false;

      if (action.itemSlug) {
        return activeItemSlugs.has(action.itemSlug);
      }

      if (action.featSlug) {
        return featSlugs.has(action.featSlug);
      }

      if (action.heritageTraitSlug) {
        return matchesHeritageTraitAction(action, heritageChoices);
      }

      const isSpeciesRow = Boolean(action.speciesSlug);
      if (isSpeciesRow) {
        if (action.speciesSlug !== species) return false;
        return matchesSpeciesOption(action, choices);
      }

      if (action.classSlug !== input.classSlug) return false;
      if (action.subclassSlug != null && action.subclassSlug !== subclass) {
        return false;
      }
      return true;
    })
    .map(mapEconomyActionRecord);
}

export function groupClassEconomyActions(
  actions: ClassEconomyAction[],
): Record<ActionEconomyBucket, ClassEconomyAction[]> {
  return {
    action: actions.filter((a) => a.economy === "action"),
    bonus: actions.filter((a) => a.economy === "bonus"),
    reaction: actions.filter((a) => a.economy === "reaction"),
    free: actions.filter((a) => a.economy === "free"),
  };
}

/** Texto do modal: description completa ou summary. */
export function economyActionDetailText(action: ClassEconomyAction): string {
  return (action.description ?? action.summary ?? "").trim();
}

export function findClassEconomyActionById(
  catalog: readonly ClassEconomyActionRecord[],
  id: string,
): ClassEconomyAction | undefined {
  const record = catalog.find((action) => action.id === id);
  return record ? mapEconomyActionRecord(record) : undefined;
}

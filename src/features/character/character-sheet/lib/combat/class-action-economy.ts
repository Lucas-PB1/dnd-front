/**
 * Resolução de features de classe com economia de ação (turno).
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
  classSlug: string;
  minLevel: number;
  /** Se definido, só aparece com essa subclasse. */
  subclassSlug?: string;
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
};

export type ResolveClassEconomyInput = {
  classSlug: string;
  level: number;
  subclassSlug?: string | null;
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
    minLevel: record.minLevel,
    subclassSlug: record.subclassSlug,
    resourceSlug: record.resourceSlug,
    freeResourceSlug: record.freeResourceSlug,
    alwaysSpendsResource: record.alwaysSpendsResource,
    summary: record.summary,
    description: record.description,
    tableAction: record.tableAction,
    spendAmount: record.spendAmount,
  };
}

export function resolveClassEconomyActions(
  catalog: readonly ClassEconomyActionRecord[],
  input: ResolveClassEconomyInput,
): ClassEconomyAction[] {
  const subclass = input.subclassSlug ?? null;
  return catalog
    .filter((action) => {
      if (action.classSlug !== input.classSlug) return false;
      if (input.level < action.minLevel) return false;
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

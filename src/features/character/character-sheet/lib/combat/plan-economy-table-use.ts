import type { ClassEconomyAction } from "@/features/character/character-sheet/lib/combat/class-action-economy";
import { isPsiTableAction } from "@/features/character/character-sheet/lib/combat/economy-table-actions";

export type ResourceCounter = { remaining: number; max: number };

export type EconomyTableUsePlan = {
  canUse: boolean;
  /** Enviado à API (Psi / Soulknife). */
  usePsiDie: boolean;
  buttonLabel: string;
  /** Contador principal (±) — uso gratuito ou o recurso da linha. */
  counterSlug: string | null;
  /** Texto auxiliar (ex.: pool de dados). */
  hint?: string;
};

/**
 * Decide se o próximo Usar é gratuito ou gasta o pool (dado psi etc.).
 * Espelha fighter-table-actions / rogue-table-actions no backend.
 */
export function planEconomyTableUse(input: {
  action: ClassEconomyAction;
  remainingBySlug: Map<string, ResourceCounter>;
  /** Checkbox: forçar gasto do pool mesmo com uso gratuito disponível. */
  preferSpendPool: boolean;
}): EconomyTableUsePlan {
  const { action, remainingBySlug, preferSpendPool } = input;
  const poolSlug = action.resourceSlug ?? null;
  const freeSlug = action.freeResourceSlug ?? null;
  const pool = poolSlug ? remainingBySlug.get(poolSlug) : undefined;
  const free = freeSlug ? remainingBySlug.get(freeSlug) : undefined;
  const poolLeft = pool?.remaining ?? 0;
  const freeLeft = free?.remaining ?? 0;

  if (action.tableAction == null) {
    return {
      canUse: false,
      usePsiDie: false,
      buttonLabel: "Usar",
      counterSlug: poolSlug,
    };
  }

  if (action.alwaysSpendsResource) {
    const amount = action.spendAmount ?? 1;
    const isPsi =
      action.tableAction != null && isPsiTableAction(action.tableAction);
    return {
      canUse: poolLeft >= amount,
      usePsiDie: true,
      buttonLabel: isPsi
        ? "Usar (1 dado)"
        : amount > 1
          ? `Usar (${amount})`
          : "Usar",
      counterSlug: poolSlug,
    };
  }

  if (freeSlug != null) {
    const useFree = freeLeft > 0 && !preferSpendPool;
    if (useFree) {
      return {
        canUse: true,
        usePsiDie: false,
        buttonLabel: "Usar (gratuito)",
        counterSlug: freeSlug,
        hint: pool
          ? `Dados ${pool.remaining}/${pool.max}`
          : undefined,
      };
    }
    return {
      canUse: poolLeft > 0,
      usePsiDie: true,
      buttonLabel: "Usar (1 dado)",
      counterSlug: freeSlug,
      hint: pool
        ? `Dados ${pool.remaining}/${pool.max}`
        : undefined,
    };
  }

  // Ações sem uso gratuito (Fôlego, Surto, …)
  const needsPool = poolSlug != null;
  return {
    canUse: !needsPool || poolLeft > 0,
    usePsiDie: Boolean(
      action.tableAction && isPsiTableAction(action.tableAction) && preferSpendPool,
    ),
    buttonLabel: "Usar",
    counterSlug: poolSlug,
  };
}

/** Há alguma linha com uso gratuito ainda disponível (para exibir o checkbox). */
export function hasAvailableFreeEconomyUse(
  actions: ClassEconomyAction[],
  remainingBySlug: Map<string, ResourceCounter>,
): boolean {
  return actions.some((action) => {
    if (!action.freeResourceSlug || action.alwaysSpendsResource) return false;
    const free = remainingBySlug.get(action.freeResourceSlug);
    return (free?.remaining ?? 0) > 0;
  });
}

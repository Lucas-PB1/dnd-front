"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CharacterRollResult } from "@/features/character/character-sheet/api/character-rolls.api";
import { useCharacterRolls } from "@/features/character/character-sheet/api/use-character-rolls";
import {
  applyDamageRollChoice,
  hasPendingDamageRollChoice,
  type DamageRollChoice,
} from "@/features/character/character-sheet/lib/combat/apply-damage-roll-choice";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type SheetRollsContextValue = ReturnType<typeof useCharacterRolls> & {
  latest: CharacterRollResult | null;
  clear: () => void;
};

const SheetRollsContext = createContext<SheetRollsContextValue | null>(null);

export function SheetRollsProvider({
  characterId,
  children,
}: {
  characterId: string;
  children: ReactNode;
}) {
  const [latest, setLatest] = useState<CharacterRollResult | null>(null);
  const clear = useCallback(() => setLatest(null), []);
  const rolls = useCharacterRolls(characterId, setLatest);
  const value = useMemo(
    () => ({ ...rolls, latest, clear }),
    [rolls, latest, clear],
  );

  return (
    <SheetRollsContext.Provider value={value}>
      {children}
      <RollResultBanner
        result={latest}
        onDismiss={clear}
        onChoose={(choice) => {
          setLatest((current) =>
            current ? applyDamageRollChoice(current, choice) : current,
          );
        }}
      />
    </SheetRollsContext.Provider>
  );
}

export function useSheetRolls() {
  const ctx = useContext(SheetRollsContext);
  if (!ctx) {
    throw new Error("useSheetRolls must be used within SheetRollsProvider");
  }
  return ctx;
}

function RollResultBanner({
  result,
  onDismiss,
  onChoose,
}: {
  result: CharacterRollResult | null;
  onDismiss: () => void;
  onChoose: (choice: DamageRollChoice) => void;
}) {
  if (!result) return null;

  const pendingChoice = hasPendingDamageRollChoice(result);
  const alternate = result.alternateRolls?.[0];
  const faces =
    result.kept && result.kept.length > 0
      ? `mantido ${result.kept.join(", ")} · rolado [${result.rolls.join(", ")}]`
      : `rolado [${result.rolls.join(", ")}]`;

  return (
    <div
      className={cn(
        "fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-xl border border-primary/40 bg-card/95 p-3 shadow-lg backdrop-blur",
        "sm:inset-x-auto sm:right-4 sm:left-auto sm:bottom-4",
      )}
      role="status"
      aria-live="polite"
      data-cy="sheet-roll-result-banner"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {result.label}
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-primary">
            {result.total}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {result.expression}
            {result.critical ? " · crítico" : ""}
            {result.hit != null && result.effectiveTargetAc != null
              ? result.hit
                ? ` · acertou CA ${result.effectiveTargetAc}`
                : ` · errou CA ${result.effectiveTargetAc}`
              : ""}
          </p>
          {result.note ? (
            <p className="mt-0.5 text-[0.7rem] text-secondary">{result.note}</p>
          ) : null}
          <p className="mt-0.5 text-[0.7rem] text-muted-foreground/90">{faces}</p>
          {pendingChoice && alternate ? (
            <div className="mt-2 space-y-1.5" data-cy="sheet-roll-alternate-choice">
              <p className="text-[0.7rem] font-medium text-foreground">
                Atacante Selvagem — escolha a rolagem da arma
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  data-cy="sheet-roll-choose-primary"
                  onClick={() => onChoose("primary")}
                >
                  1ª: {result.total}
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  data-cy="sheet-roll-choose-alternate"
                  onClick={() => onChoose("alternate")}
                >
                  2ª: {alternate.total}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={onDismiss}>
          Fechar
        </Button>
      </div>
    </div>
  );
}

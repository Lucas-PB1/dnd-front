"use client";

import { BoltIcon } from "@heroicons/react/24/outline";

import type { SkirmishAttackResult } from "@/features/skirmish/skirmishes/api/skirmishes.api";
import type { RemainingSpellSlot } from "@/features/skirmish/skirmishes/lib/skirmish-attack-flag-availability";
import type { SkirmishAttackFlagKey } from "@/features/skirmish/skirmishes/lib/skirmish-attack-flag-availability";
import {
  skirmishAttackDamageLine,
  skirmishAttackHeadline,
} from "@/features/skirmish/skirmishes/lib/skirmish-attack-outcome";
import {
  SkirmishAttackFlags,
  type SkirmishAttackFlagsState,
} from "@/features/skirmish/skirmishes/ui/detail/skirmish-attack-flags";
import { cn } from "@/shared/lib/utils";
import { SearchableSelect } from "@/shared/ui/searchable-select";

const ADVANTAGE_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "advantage", label: "Vantagem" },
  { value: "disadvantage", label: "Desvantagem" },
] as const;

export type SkirmishAdvantageMode =
  (typeof ADVANTAGE_OPTIONS)[number]["value"];

type SelectOption = { value: string; label: string };

type SkirmishAttackPanelProps = {
  myTurn: boolean;
  creatureActing: boolean;
  finished?: boolean;
  weaponKey: string;
  weaponOptions: SelectOption[];
  onWeaponChange: (value: string) => void;
  advantage: SkirmishAdvantageMode;
  onAdvantageChange: (value: SkirmishAdvantageMode) => void;
  visibleFlagKeys: readonly SkirmishAttackFlagKey[];
  flags: SkirmishAttackFlagsState;
  onFlagsChange: (next: SkirmishAttackFlagsState) => void;
  smiteSlots: readonly RemainingSpellSlot[];
  last: SkirmishAttackResult | null;
  attackError: string | null;
  endTurnError: string | null;
  finishError: string | null;
};

export function SkirmishAttackPanel({
  myTurn,
  creatureActing,
  finished = false,
  weaponKey,
  weaponOptions,
  onWeaponChange,
  advantage,
  onAdvantageChange,
  visibleFlagKeys,
  flags,
  onFlagsChange,
  smiteSlots,
  last,
  attackError,
  endTurnError,
  finishError,
}: SkirmishAttackPanelProps) {
  if (finished) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Combate encerrado. Veja o desfecho acima ou a crônica na aba Log.
        </p>
        {last ? (
          <div
            className="space-y-0.5 rounded-lg border border-border/60 px-2.5 py-2 text-sm"
            role="status"
          >
            <p
              className={cn(
                "inline-flex items-center gap-1.5 font-medium",
                last.critical && "font-heading text-accent",
                !last.hit && !last.critical && "text-muted-foreground",
              )}
            >
              {last.critical ? (
                <BoltIcon className="size-4 shrink-0" aria-hidden />
              ) : null}
              {skirmishAttackHeadline(last)}
            </p>
            {skirmishAttackDamageLine(last) ? (
              <p className="text-muted-foreground">
                {skirmishAttackDamageLine(last)}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  if (!myTurn || creatureActing) {
    return (
      <p className="text-sm text-muted-foreground">
        {creatureActing
          ? "Aguarde o ataque da criatura no log."
          : "Turno da criatura — configure o golpe quando for a sua vez."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {weaponOptions.length > 0 ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex min-w-40 flex-1 flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Arma</span>
            <SearchableSelect
              className="h-9 w-full text-sm"
              value={weaponKey}
              options={weaponOptions}
              onValueChange={onWeaponChange}
              placeholder="Primeira arma da ficha"
            />
          </label>
          <label className="flex min-w-40 flex-1 flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Vantagem</span>
            <SearchableSelect
              className="h-9 w-full text-sm"
              value={advantage}
              options={[...ADVANTAGE_OPTIONS]}
              onValueChange={(next) =>
                onAdvantageChange(next as SkirmishAdvantageMode)
              }
            />
          </label>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhuma arma na ficha. Equipe uma arma na aba de inventário.
        </p>
      )}

      <SkirmishAttackFlags
        visibleKeys={visibleFlagKeys}
        value={flags}
        onChange={onFlagsChange}
        smiteSlots={smiteSlots}
      />

      {last ? (
        <div
          className={cn(
            "space-y-0.5 rounded-lg border border-border/60 px-2.5 py-2 text-sm motion-fade",
          )}
          role="status"
        >
          <p
            className={cn(
              "inline-flex items-center gap-1.5 font-medium",
              last.critical && "font-heading text-accent",
              !last.hit && !last.critical && "text-muted-foreground",
            )}
          >
            {last.critical ? (
              <BoltIcon className="size-4 shrink-0" aria-hidden />
            ) : null}
            {skirmishAttackHeadline(last)}
          </p>
          {skirmishAttackDamageLine(last) ? (
            <p className="text-muted-foreground">
              {skirmishAttackDamageLine(last)}
            </p>
          ) : null}
          {last.note ? (
            <p className="text-muted-foreground">{last.note}</p>
          ) : null}
        </div>
      ) : null}

      {attackError ? (
        <p className="text-sm text-destructive">{attackError}</p>
      ) : null}
      {endTurnError ? (
        <p className="text-sm text-destructive">{endTurnError}</p>
      ) : null}
      {finishError ? (
        <p className="text-sm text-destructive">{finishError}</p>
      ) : null}
    </div>
  );
}

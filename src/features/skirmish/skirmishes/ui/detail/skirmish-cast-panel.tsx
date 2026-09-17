"use client";

import type { RemainingSpellSlot } from "@/features/skirmish/skirmishes/lib/skirmish-attack-flag-availability";
import { Button } from "@/shared/ui/button";
import { SearchableSelect } from "@/shared/ui/searchable-select";

export type SkirmishCastSpellOption = {
  value: string;
  label: string;
  level: number;
};

type SkirmishCastPanelProps = {
  myTurn: boolean;
  creatureActing: boolean;
  spellSlug: string;
  spellOptions: SkirmishCastSpellOption[];
  onSpellChange: (value: string) => void;
  spellSlotLevel: number;
  onSlotLevelChange: (level: number) => void;
  slots: readonly RemainingSpellSlot[];
  spellSaveDc?: number | null;
  spellAttackBonus?: number | null;
  castPending: boolean;
  castError: string | null;
  onCast: () => void;
};

function formatBonus(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

function slotSummary(slots: readonly RemainingSpellSlot[]): string {
  if (slots.length === 0) return "Sem espaços restantes";
  return slots
    .map((slot) => `${slot.level}º×${slot.remaining}`)
    .join(" · ");
}

export function SkirmishCastPanel({
  myTurn,
  creatureActing,
  spellSlug,
  spellOptions,
  onSpellChange,
  spellSlotLevel,
  onSlotLevelChange,
  slots,
  spellSaveDc,
  spellAttackBonus,
  castPending,
  castError,
  onCast,
}: SkirmishCastPanelProps) {
  if (spellOptions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma magia preparada nesta ficha para conjurar no combate.
      </p>
    );
  }

  if (!myTurn || creatureActing) {
    return (
      <p className="text-sm text-muted-foreground">
        Conjure quando for o seu turno.
      </p>
    );
  }

  const selected = spellOptions.find((row) => row.value === spellSlug);
  const isCantrip = (selected?.level ?? 0) === 0;
  const usableSlots = slots.filter(
    (slot) => slot.level >= (selected?.level ?? 1),
  );
  const stats = [
    spellSaveDc != null ? `CD ${spellSaveDc}` : null,
    spellAttackBonus != null
      ? `Ataque ${formatBonus(spellAttackBonus)}`
      : null,
  ].filter(Boolean);

  return (
    <div className="space-y-3">
      {stats.length > 0 || slots.length > 0 ? (
        <div className="space-y-0.5 text-xs text-muted-foreground">
          {stats.length > 0 ? <p>{stats.join(" · ")}</p> : null}
          <p>Espaços: {slotSummary(slots)}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Magia</span>
          <SearchableSelect
            className="h-9 w-full text-sm"
            value={spellSlug}
            options={spellOptions.map((row) => ({
              value: row.value,
              label: row.label,
            }))}
            onValueChange={onSpellChange}
            placeholder="Escolha a magia"
          />
        </label>
        {!isCantrip && usableSlots.length > 0 ? (
          <label className="flex min-w-28 flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Espaço</span>
            <select
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={spellSlotLevel}
              onChange={(event) =>
                onSlotLevelChange(Number(event.target.value))
              }
            >
              {usableSlots.map((slot) => (
                <option key={slot.level} value={slot.level}>
                  Nível {slot.level} ({slot.remaining})
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {isCantrip ? (
          <p className="pb-2 text-xs text-muted-foreground sm:pb-2.5">
            Truque — sem espaço
          </p>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          disabled={!spellSlug || castPending || (!isCantrip && usableSlots.length === 0)}
          onClick={onCast}
        >
          {castPending ? "Conjurando…" : "Conjurar"}
        </Button>
      </div>
      {castError ? (
        <p className="text-sm text-destructive">{castError}</p>
      ) : null}
    </div>
  );
}

"use client";

import { DeathSaveTrack } from "@/features/character/character-sheet/ui/beyond/combat/death-save-track";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Field, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

type ConditionOption = {
  slug: string;
  name: string;
};

type CombatStatusEditorProps = {
  conditions: ConditionOption[];
  conditionsLoading: boolean;
  selectedConditions: string[];
  tempHpDraft: string;
  inspirationDraft: boolean;
  deathSuccessDraft: number;
  deathFailDraft: number;
  isPending: boolean;
  onToggleCondition: (slug: string) => void;
  onTempHpChange: (value: string) => void;
  onInspirationChange: (value: boolean) => void;
  onDeathSuccessChange: (value: number) => void;
  onDeathFailChange: (value: number) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function CombatStatusEditor({
  conditions,
  conditionsLoading,
  selectedConditions,
  tempHpDraft,
  inspirationDraft,
  deathSuccessDraft,
  deathFailDraft,
  isPending,
  onToggleCondition,
  onTempHpChange,
  onInspirationChange,
  onDeathSuccessChange,
  onDeathFailChange,
  onSave,
  onCancel,
}: CombatStatusEditorProps) {
  return (
    <div className="mt-2 space-y-2 rounded-lg border border-border/60 bg-background/50 p-2.5">
      {conditionsLoading ? (
        <p className="text-sm text-muted-foreground">Carregando condições…</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {conditions.map((condition) => {
            const selected = selectedConditions.includes(condition.slug);
            return (
              <button
                key={condition.slug}
                type="button"
                onClick={() => onToggleCondition(condition.slug)}
                className={cn(
                  "rounded-md border px-2 py-1 text-xs transition-colors",
                  selected
                    ? "border-primary/50 bg-primary/15 font-medium text-primary"
                    : "border-border/80 bg-muted/20 text-muted-foreground hover:text-foreground",
                )}
              >
                {condition.name}
              </button>
            );
          })}
        </div>
      )}

      <Field className="max-w-[8rem]">
        <FieldLabel htmlFor="temp-hp">PV temporários</FieldLabel>
        <Input
          id="temp-hp"
          type="number"
          min={0}
          value={tempHpDraft}
          onChange={(event) => onTempHpChange(event.target.value)}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={inspirationDraft}
          onChange={(event) => onInspirationChange(event.target.checked)}
        />
        Inspiração
      </label>

      <div className="grid gap-2 sm:grid-cols-2">
        <DeathSaveTrack
          label="Sucessos (morte)"
          value={deathSuccessDraft}
          onChange={onDeathSuccessChange}
        />
        <DeathSaveTrack
          label="Falhas (morte)"
          value={deathFailDraft}
          tone="danger"
          onChange={onDeathFailChange}
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" size="sm" disabled={isPending} onClick={onSave}>
          {isPending ? "Salvando…" : "Salvar"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

"use client";

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
  isPending: boolean;
  onToggleCondition: (slug: string) => void;
  onTempHpChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function CombatStatusEditor({
  conditions,
  conditionsLoading,
  selectedConditions,
  tempHpDraft,
  isPending,
  onToggleCondition,
  onTempHpChange,
  onSave,
  onCancel,
}: CombatStatusEditorProps) {
  return (
    <div className="space-y-3">
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

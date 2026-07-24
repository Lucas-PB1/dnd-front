"use client";

import { useMemo, useState, type ReactNode } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import { abilityModifierValue, formatSkillBonus } from "@/entities/character";
import {
  useCharacterState,
  usePatchCharacterState,
} from "@/features/character-sheet/api/use-character-state";
import { SheetChip } from "@/features/character-sheet/ui/sheet-ui";
import { useConditions } from "@/features/reference-catalog/api/use-reference";
import { Button } from "@/shared/ui/button";
import { Field, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

type BeyondCombatHubProps = {
  characterId: string;
  character: CharacterDetail;
};

function CombatMetric({
  label,
  value,
  hint,
  emphasize = false,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  emphasize?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center justify-center rounded-lg border px-3 py-2 text-center",
        emphasize
          ? "border-primary/45 bg-primary/8"
          : "border-border/70 bg-card/70",
      )}
    >
      <span className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        {label}
      </span>
      <span className="font-heading mt-0.5 text-2xl font-semibold leading-none tabular-nums">
        {value}
      </span>
      {hint ? (
        <span className="mt-1 max-w-full truncate text-[0.65rem] text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export function BeyondCombatHub({
  characterId,
  character,
}: BeyondCombatHubProps) {
  const stateQuery = useCharacterState(characterId);
  const patchState = usePatchCharacterState(characterId);
  const conditionsCatalog = useConditions();

  const [editingStatus, setEditingStatus] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [tempHpDraft, setTempHpDraft] = useState("");

  const state = stateQuery.data;
  const initiative = abilityModifierValue(character.abilityScores.destreza);

  const conditionNameBySlug = useMemo(() => {
    const names = new Map<string, string>();
    for (const condition of conditionsCatalog.data ?? []) {
      names.set(condition.slug, condition.name);
    }
    return names;
  }, [conditionsCatalog.data]);

  function openStatusEditor() {
    setSelectedConditions([...(state?.conditions ?? [])]);
    setTempHpDraft(String(state?.tempHp ?? 0));
    setEditingStatus(true);
  }

  function toggleCondition(slug: string) {
    setSelectedConditions((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );
  }

  async function saveStatus() {
    await patchState.mutateAsync({
      conditions: selectedConditions,
      tempHp: Number(tempHpDraft) || 0,
    });
    setEditingStatus(false);
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card p-2.5">
      <div className="grid gap-2 sm:grid-cols-[6rem_7rem_minmax(10rem,1fr)_minmax(12rem,1.35fr)]">
        <CombatMetric label="Iniciativa" value={formatSkillBonus(initiative)} />
        <CombatMetric
          label="Classe de armadura"
          value={character.armorClass}
          hint={character.armorClassNote}
          emphasize
        />

        <div className="min-w-0 rounded-lg border border-border/70 bg-card/70 px-3 py-2">
          <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            Defesas
          </p>
          <p className="mt-1 truncate text-sm">
            {character.armorClassNote || "Nenhuma defesa adicional"}
          </p>
        </div>

        <div className="min-w-0 rounded-lg border border-border/70 bg-card/70 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              Condições
            </p>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              disabled={!state}
              onClick={openStatusEditor}
            >
              Editar
            </Button>
          </div>
          <div className="mt-1 flex min-w-0 flex-wrap gap-1">
            {state?.conditions?.length ? (
              state.conditions.map((slug) => (
                <SheetChip key={slug} active>
                  {conditionNameBySlug.get(slug) ?? slug}
                </SheetChip>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Nenhuma</span>
            )}
          </div>
        </div>
      </div>

      {editingStatus ? (
        <div className="mt-2 space-y-2 rounded-lg border border-border/60 bg-background/50 p-2.5">
          {conditionsCatalog.isPending ? (
            <p className="text-sm text-muted-foreground">
              Carregando condições…
            </p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {(conditionsCatalog.data ?? []).map((condition) => {
                const selected = selectedConditions.includes(condition.slug);
                return (
                  <button
                    key={condition.slug}
                    type="button"
                    onClick={() => toggleCondition(condition.slug)}
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
              onChange={(event) => setTempHpDraft(event.target.value)}
            />
          </Field>

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={patchState.isPending}
              onClick={saveStatus}
            >
              {patchState.isPending ? "Salvando…" : "Salvar"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setEditingStatus(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : null}

      {patchState.isError ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {patchState.error instanceof Error
            ? patchState.error.message
            : "Não foi possível atualizar as condições"}
        </p>
      ) : null}
    </div>
  );
}

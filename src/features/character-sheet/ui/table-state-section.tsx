"use client";

import { useMemo, useState } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import type { CharacterCatalogLabels } from "@/features/character-sheet/api/use-character-catalog-labels";
import {
  useCastSpell,
  useCharacterState,
  usePatchCharacterState,
  useTakeRest,
} from "@/features/character-sheet/api/use-character-state";
import {
  SheetChip,
  SheetHpBar,
  SheetSlotPips,
} from "@/features/character-sheet/ui/sheet-ui";
import { useConditions } from "@/features/reference-catalog/api/use-reference";
import { Button } from "@/shared/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { nativeSelectClassName } from "@/shared/ui/native-select";
import { cn } from "@/shared/lib/utils";

const SLOT_LEVELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

type TableStateSectionProps = {
  characterId: string;
  character: CharacterDetail;
  labels: CharacterCatalogLabels;
};

export function TableStateSection({
  characterId,
  character,
  labels,
}: TableStateSectionProps) {
  const stateQuery = useCharacterState(characterId);
  const patchState = usePatchCharacterState(characterId);
  const castSpell = useCastSpell(characterId);
  const takeRest = useTakeRest(characterId);
  const conditionsCatalog = useConditions();

  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [tempHp, setTempHp] = useState("");
  const [concentration, setConcentration] = useState("");
  const [castSlug, setCastSlug] = useState("");
  const [castSlotLevel, setCastSlotLevel] = useState("");
  const [showStateForm, setShowStateForm] = useState(false);

  const state = stateQuery.data;
  const hpCurrent =
    state?.hitPointsCurrent ??
    character.hitPointsCurrent ??
    character.hitPointsMax;
  const hpMax = state?.hitPointsMax ?? character.hitPointsMax;

  const mutationError =
    patchState.error ?? castSpell.error ?? takeRest.error ?? stateQuery.error;

  const hasSpellSlots = state
    ? SLOT_LEVELS.some((lv) => (state.spellSlotsMax[lv] ?? 0) > 0)
    : false;

  const conditionNameBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of conditionsCatalog.data ?? []) {
      map.set(row.slug, row.name);
    }
    return map;
  }, [conditionsCatalog.data]);

  function openStateForm() {
    if (!state) return;
    setSelectedConditions([...state.conditions]);
    setTempHp(String(state.tempHp));
    setConcentration(state.concentratingOn ?? "");
    setShowStateForm(true);
  }

  function toggleCondition(slug: string) {
    setSelectedConditions((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  async function saveState() {
    await patchState.mutateAsync({
      conditions: selectedConditions,
      tempHp: Number(tempHp) || 0,
      concentratingOn: concentration.trim() || null,
    });
    setShowStateForm(false);
  }

  async function handleCast() {
    if (!castSlug) return;
    await castSpell.mutateAsync({
      spellSlug: castSlug,
      slotLevel: castSlotLevel ? Number(castSlotLevel) : undefined,
    });
    setCastSlug("");
    setCastSlotLevel("");
  }

  if (stateQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando mesa…</p>;
  }

  if (!state) {
    return (
      <p className="text-sm text-muted-foreground">
        Estado de jogo indisponível.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-3">
          <p className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
            Pontos de vida
          </p>
          <div className="mt-1.5">
            <SheetHpBar
              current={hpCurrent}
              max={hpMax}
              temp={state.tempHp}
            />
          </div>
        </div>
        <div className="space-y-3 rounded-xl border border-border/70 bg-background/50 px-3 py-3">
          <div>
            <p className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
              Concentração
            </p>
            <p className="mt-0.5 text-sm font-medium">
              {state.concentratingOn
                ? labels.resolveSpell(state.concentratingOn)
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
              Condições
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {state.conditions.length > 0 ? (
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
      </div>

      {hasSpellSlots ? (
        <div className="space-y-2">
          <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
            Slots de magia
          </p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SLOT_LEVELS.map((level) => {
              const max = state.spellSlotsMax[level] ?? 0;
              if (max === 0) return null;
              const used = state.spellSlotsUsed[level] ?? 0;
              const remaining = state.spellSlotsRemaining[level] ?? 0;
              return (
                <li
                  key={level}
                  className="rounded-xl border border-border/70 bg-background/40 px-3 py-2.5"
                >
                  <div className="mb-1.5 flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium">{level}º círculo</span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {remaining}/{max}
                    </span>
                  </div>
                  <SheetSlotPips max={max} used={used} />
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={takeRest.isPending}
          onClick={() => takeRest.mutate({ type: "short" })}
        >
          Descanso curto
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={takeRest.isPending}
          onClick={() => takeRest.mutate({ type: "long" })}
        >
          Descanso longo
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={openStateForm}>
          Editar estado
        </Button>
      </div>

      {showStateForm ? (
        <FieldGroup className="rounded-xl border border-border/80 bg-background/40 p-4">
          <Field>
            <FieldLabel>Condições</FieldLabel>
            {conditionsCatalog.isPending ? (
              <p className="text-sm text-muted-foreground">
                Carregando condições…
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {(conditionsCatalog.data ?? []).map((condition) => {
                  const checked = selectedConditions.includes(condition.slug);
                  return (
                    <button
                      key={condition.slug}
                      type="button"
                      onClick={() => toggleCondition(condition.slug)}
                      className={cn(
                        "rounded-md border px-2 py-1 text-xs transition-colors",
                        checked
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
          </Field>
          <Field>
            <FieldLabel htmlFor="tempHp">PV temporários</FieldLabel>
            <Input
              id="tempHp"
              type="number"
              min={0}
              value={tempHp}
              onChange={(e) => setTempHp(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="concentration">Concentração</FieldLabel>
            <select
              id="concentration"
              value={concentration}
              onChange={(e) => setConcentration(e.target.value)}
              className={nativeSelectClassName}
            >
              <option value="">Nenhuma</option>
              {character.characterSpells.map((s) => (
                <option key={s.spellSlug} value={s.spellSlug}>
                  {labels.resolveSpell(s.spellSlug)}
                </option>
              ))}
            </select>
          </Field>
          <Button
            type="button"
            size="sm"
            disabled={patchState.isPending}
            onClick={saveState}
          >
            {patchState.isPending ? "Salvando…" : "Salvar estado"}
          </Button>
        </FieldGroup>
      ) : null}

      {character.characterSpells.length > 0 ? (
        <div className="space-y-3 rounded-xl border border-border/70 bg-background/40 p-4">
          <p className="text-sm font-medium">Conjurar magia</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field className="flex-1">
              <FieldLabel htmlFor="cast-spell">Magia</FieldLabel>
              <select
                id="cast-spell"
                value={castSlug}
                onChange={(e) => setCastSlug(e.target.value)}
                className={nativeSelectClassName}
              >
                <option value="">Selecione</option>
                {character.characterSpells.map((s) => (
                  <option key={s.spellSlug} value={s.spellSlug}>
                    {labels.resolveSpell(s.spellSlug)}
                  </option>
                ))}
              </select>
            </Field>
            <Field>
              <FieldLabel htmlFor="cast-slot">Slot (opcional)</FieldLabel>
              <Input
                id="cast-slot"
                type="number"
                min={1}
                max={9}
                value={castSlotLevel}
                onChange={(e) => setCastSlotLevel(e.target.value)}
                className="w-24"
              />
            </Field>
            <Button
              type="button"
              size="sm"
              disabled={!castSlug || castSpell.isPending}
              onClick={handleCast}
            >
              Conjurar
            </Button>
          </div>
        </div>
      ) : null}

      {mutationError ? (
        <p className="text-sm text-destructive">
          {mutationError instanceof Error
            ? mutationError.message
            : "Erro na mesa"}
        </p>
      ) : null}
    </div>
  );
}

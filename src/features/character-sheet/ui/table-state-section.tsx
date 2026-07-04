"use client";

import { useState } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import type { CharacterCatalogLabels } from "@/features/character-sheet/api/use-character-catalog-labels";
import {
  useCastSpell,
  useCharacterState,
  usePatchCharacterState,
  useTakeRest,
} from "@/features/character-sheet/api/use-character-state";
import { Button } from "@/shared/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
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

  const [conditionsText, setConditionsText] = useState("");
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

  function openStateForm() {
    if (!state) return;
    setConditionsText(state.conditions.join(", "));
    setTempHp(String(state.tempHp));
    setConcentration(state.concentratingOn ?? "");
    setShowStateForm(true);
  }

  async function saveState() {
    await patchState.mutateAsync({
      conditions: conditionsText
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      tempHp: Number(tempHp) || 0,
      concentratingOn: concentration.trim() || null,
    });
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
    <div className="space-y-6">
      <dl className="grid gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs font-medium text-muted-foreground">
            Pontos de vida
          </dt>
          <dd className="text-lg">
            {hpCurrent ?? "—"} / {hpMax ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">
            PV temporários
          </dt>
          <dd className="text-lg">{state.tempHp}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">
            Concentração
          </dt>
          <dd className="text-sm">
            {state.concentratingOn
              ? labels.resolveSpell(state.concentratingOn)
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">
            Condições
          </dt>
          <dd className="text-sm">
            {state.conditions.length > 0 ? state.conditions.join(", ") : "—"}
          </dd>
        </div>
      </dl>

      {hasSpellSlots ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Slots de magia</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4">Círculo</th>
                  <th className="pb-2 pr-4">Máx</th>
                  <th className="pb-2 pr-4">Usados</th>
                  <th className="pb-2">Restantes</th>
                </tr>
              </thead>
              <tbody>
                {SLOT_LEVELS.map((level) => {
                  const max = state.spellSlotsMax[level] ?? 0;
                  if (max === 0) return null;
                  return (
                    <tr key={level} className="border-b border-border/60">
                      <td className="py-2 pr-4">{level}º</td>
                      <td className="py-2 pr-4 font-mono">{max}</td>
                      <td className="py-2 pr-4 font-mono">
                        {state.spellSlotsUsed[level] ?? 0}
                      </td>
                      <td className="py-2 font-mono">
                        {state.spellSlotsRemaining[level] ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
        <FieldGroup className="rounded-lg border border-border p-4">
          <Field>
            <FieldLabel htmlFor="conditions">
              Condições (separadas por vírgula)
            </FieldLabel>
            <Input
              id="conditions"
              value={conditionsText}
              onChange={(e) => setConditionsText(e.target.value)}
              placeholder="ex.: envenenado, caído"
            />
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
              className={cn(
                "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm",
                "dark:bg-input/30",
              )}
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
        <div className="space-y-3 rounded-lg border border-border p-4">
          <p className="text-sm font-medium">Conjurar magia</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field className="flex-1">
              <FieldLabel htmlFor="cast-spell">Magia</FieldLabel>
              <select
                id="cast-spell"
                value={castSlug}
                onChange={(e) => setCastSlug(e.target.value)}
                className={cn(
                  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm",
                  "dark:bg-input/30",
                )}
              >
                <option value="">Selecione</option>
                {character.characterSpells.map((s) => (
                  <option key={s.spellSlug} value={s.spellSlug}>
                    {labels.resolveSpell(s.spellSlug)}
                  </option>
                ))}
              </select>
            </Field>
            <Field className="w-32">
              <FieldLabel htmlFor="cast-slot">Círculo do slot</FieldLabel>
              <Input
                id="cast-slot"
                type="number"
                min={0}
                max={9}
                placeholder="auto"
                value={castSlotLevel}
                onChange={(e) => setCastSlotLevel(e.target.value)}
              />
            </Field>
            <Button
              type="button"
              disabled={!castSlug || castSpell.isPending}
              onClick={handleCast}
            >
              {castSpell.isPending ? "Conjurando…" : "Conjurar"}
            </Button>
          </div>
        </div>
      ) : null}

      {mutationError ? (
        <p className="text-sm text-destructive" role="alert">
          {mutationError instanceof Error
            ? mutationError.message
            : "Erro na mesa de jogo"}
        </p>
      ) : null}
    </div>
  );
}

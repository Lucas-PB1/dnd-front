"use client";

import { useMemo, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import type { CharacterSpell } from "@/entities/character/sheet-types";
import type { CharacterDetail } from "@/entities/character/types";
import type { CharacterState } from "@/entities/character/session-types";
import type { SpellSummary } from "@/entities/spell/types";
import type { CharacterCatalogLabels } from "@/features/character-sheet/api/use-character-catalog-labels";
import {
  useCastSpell,
  useCharacterState,
  usePatchCharacterState,
} from "@/features/character-sheet/api/use-character-state";
import { SheetSlotPips } from "@/features/character-sheet/ui/sheet-ui";
import { useSpells } from "@/features/spell-catalog/api/use-spells";
import { Button } from "@/shared/ui/button";
import { nativeSelectClassName } from "@/shared/ui/native-select";
import { PhbProse } from "@/shared/ui/phb-prose";
import { cn } from "@/shared/lib/utils";

const SLOT_LEVELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

const LIST_TYPE_LABELS: Record<CharacterSpell["listType"], string> = {
  known: "Conhecida",
  prepared: "Preparada",
  always_prepared: "Sempre preparada",
};

type BeyondSpellsTabProps = {
  characterId: string;
  character: CharacterDetail;
  labels: CharacterCatalogLabels;
  onEdit?: () => void;
};

type SpellRowModel = {
  spell: CharacterSpell;
  detail: SpellSummary | undefined;
  level: number;
  name: string;
};

export function BeyondSpellsTab({
  characterId,
  character,
  labels,
  onEdit,
}: BeyondSpellsTabProps) {
  const stateQuery = useCharacterState(characterId);
  const patchState = usePatchCharacterState(characterId);
  const castSpell = useCastSpell(characterId);
  const spellsCatalog = useSpells();

  const state = stateQuery.data;
  const spellBySlug = useMemo(() => {
    const map = new Map<string, SpellSummary>();
    for (const spell of spellsCatalog.data?.data ?? []) {
      map.set(spell.slug, spell);
    }
    return map;
  }, [spellsCatalog.data?.data]);

  const rows = useMemo(() => {
    return character.characterSpells.map((spell) => {
      const detail = spellBySlug.get(spell.spellSlug);
      const level = detail?.level ?? -1;
      return {
        spell,
        detail,
        level,
        name: labels.resolveSpell(spell.spellSlug),
      } satisfies SpellRowModel;
    });
  }, [character.characterSpells, labels, spellBySlug]);

  const byLevel = useMemo(() => {
    const map = new Map<number, SpellRowModel[]>();
    for (const row of rows) {
      const key = row.level < 0 ? -1 : row.level;
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name, "pt"));
    }
    return [...map.entries()].sort(([a], [b]) => {
      if (a < 0) return 1;
      if (b < 0) return -1;
      return a - b;
    });
  }, [rows]);

  const activeSlots = useMemo(() => {
    if (!state) return [];
    return SLOT_LEVELS.filter((lv) => (state.spellSlotsMax[lv] ?? 0) > 0).map(
      (lv) => ({
        level: Number(lv),
        max: state.spellSlotsMax[lv] ?? 0,
        used: state.spellSlotsUsed[lv] ?? 0,
        remaining: state.spellSlotsRemaining[lv] ?? 0,
      }),
    );
  }, [state]);

  const mutationError =
    patchState.error ?? castSpell.error ?? stateQuery.error;

  async function clearConcentration() {
    await patchState.mutateAsync({ concentratingOn: null });
  }

  async function handleCast(spellSlug: string, slotLevel?: number) {
    await castSpell.mutateAsync({
      spellSlug,
      slotLevel,
    });
  }

  if (character.characterSpells.length === 0) {
    return (
      <div className="space-y-3">
        <SpellsTabHeader onEdit={onEdit} />
        <p className="text-sm text-muted-foreground">
          Nenhuma magia registrada. Use Editar para adicionar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SpellsTabHeader onEdit={onEdit} />

      {stateQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Carregando slots…</p>
      ) : (
        <div className="space-y-3 border-b border-border/50 pb-3">
          {activeSlots.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {activeSlots.map((slot) => (
                <li
                  key={slot.level}
                  className="flex min-w-[5.5rem] flex-col gap-1 rounded-lg border border-border/70 bg-background/40 px-2.5 py-2"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                      {slot.level}º
                    </span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {slot.remaining}/{slot.max}
                    </span>
                  </div>
                  <SheetSlotPips max={slot.max} used={slot.used} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sem espaços de magia neste nível.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Concentração
              </p>
              <p className="mt-0.5 text-sm font-medium">
                {state?.concentratingOn
                  ? labels.resolveSpell(state.concentratingOn)
                  : "Nenhuma"}
              </p>
            </div>
            {state?.concentratingOn ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={patchState.isPending}
                onClick={clearConcentration}
              >
                {patchState.isPending ? "Limpando…" : "Encerrar"}
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {spellsCatalog.isPending && spellBySlug.size === 0 ? (
        <p className="text-sm text-muted-foreground">Carregando magias…</p>
      ) : (
        <div className="space-y-4">
          {byLevel.map(([level, levelRows]) => (
            <section key={level} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="rounded bg-muted/70 px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold tabular-nums text-muted-foreground">
                  {level < 0
                    ? "…"
                    : level === 0
                      ? "Truques"
                      : `${level}º`}
                </span>
                <span className="h-px flex-1 bg-border/50" aria-hidden />
              </div>
              <ul className="divide-y divide-border/40 overflow-hidden rounded-lg border border-border/70 bg-background/40">
                {levelRows.map((row) => (
                  <SpellRow
                    key={`${row.spell.spellSlug}-${row.spell.listType}`}
                    row={row}
                    state={state}
                    casting={castSpell.isPending}
                    onCast={handleCast}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {mutationError ? (
        <p className="text-sm text-destructive" role="alert">
          {mutationError instanceof Error
            ? mutationError.message
            : "Erro ao atualizar magias"}
        </p>
      ) : null}
    </div>
  );
}

function SpellsTabHeader({ onEdit }: { onEdit?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-sm font-semibold tracking-tight">Magias</h3>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="text-[0.65rem] font-medium tracking-wide text-primary uppercase hover:underline"
        >
          Editar
        </button>
      ) : null}
    </div>
  );
}

function SpellRow({
  row,
  state,
  casting,
  onCast,
}: {
  row: SpellRowModel;
  state: CharacterState | undefined;
  casting: boolean;
  onCast: (spellSlug: string, slotLevel?: number) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [slotLevel, setSlotLevel] = useState<number | null>(null);

  const isCantrip = row.level === 0;
  const isUnknownLevel = row.level < 0;
  const baseLevel = Math.max(row.level, 1);

  const availableUpcastLevels = useMemo(() => {
    if (!state || isCantrip || isUnknownLevel) return [];
    return SLOT_LEVELS.map(Number).filter((lv) => {
      if (lv < baseLevel) return false;
      return (state.spellSlotsRemaining[String(lv)] ?? 0) > 0;
    });
  }, [state, isCantrip, isUnknownLevel, baseLevel]);

  const selectedSlot =
    slotLevel ?? availableUpcastLevels[0] ?? (isCantrip ? undefined : baseLevel);

  const canCast =
    isCantrip ||
    (selectedSlot != null &&
      (state?.spellSlotsRemaining[String(selectedSlot)] ?? 0) > 0);

  const listLabel = LIST_TYPE_LABELS[row.spell.listType];
  const metaParts = [
    row.detail?.schoolName,
    listLabel,
    row.detail?.castingTime,
  ].filter(Boolean);

  async function cast() {
    if (isCantrip) {
      await onCast(row.spell.spellSlug);
      return;
    }
    if (selectedSlot == null) return;
    await onCast(row.spell.spellSlug, selectedSlot);
  }

  return (
    <li>
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-start gap-2 text-left"
        >
          <ChevronDownIcon
            className={cn(
              "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-medium text-foreground">
                {row.name}
              </span>
              {row.detail?.concentration ? (
                <span
                  className="rounded border border-primary/40 px-1 py-px text-[0.6rem] font-semibold tracking-wide text-primary uppercase"
                  title="Concentração"
                >
                  C
                </span>
              ) : null}
              {row.detail?.ritual ? (
                <span
                  className="rounded border border-border px-1 py-px text-[0.6rem] font-semibold tracking-wide text-muted-foreground uppercase"
                  title="Ritual"
                >
                  R
                </span>
              ) : null}
            </span>
            {metaParts.length > 0 ? (
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {metaParts.join(" · ")}
              </span>
            ) : null}
          </span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {!isCantrip && !isUnknownLevel && availableUpcastLevels.length > 1 ? (
            <>
              <label
                className="sr-only"
                htmlFor={`slot-${row.spell.spellSlug}`}
              >
                Espaço
              </label>
              <select
                id={`slot-${row.spell.spellSlug}`}
                className={cn(nativeSelectClassName, "h-7 w-[4.5rem] text-xs")}
                value={selectedSlot ?? ""}
                disabled={casting || availableUpcastLevels.length === 0}
                onChange={(e) => setSlotLevel(Number(e.target.value))}
              >
                {availableUpcastLevels.map((lv) => (
                  <option key={lv} value={lv}>
                    {lv}º
                  </option>
                ))}
              </select>
            </>
          ) : null}

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={casting || !canCast || isUnknownLevel}
            title={
              isUnknownLevel
                ? "Aguardando catálogo"
                : !canCast
                  ? "Sem espaços disponíveis"
                  : undefined
            }
            onClick={cast}
          >
            Conjurar
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border/40 bg-muted/15 px-3 py-3">
          {row.detail?.description ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {[
                  row.detail.range ? `Alcance ${row.detail.range}` : null,
                  row.detail.duration ? `Duração ${row.detail.duration}` : null,
                  row.detail.componentsLabel,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <PhbProse text={row.detail.description} />
              {row.detail.higherLevels ? (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-foreground">
                    Em níveis superiores
                  </p>
                  <PhbProse text={row.detail.higherLevels} />
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Descrição indisponível.
            </p>
          )}
        </div>
      ) : null}
    </li>
  );
}

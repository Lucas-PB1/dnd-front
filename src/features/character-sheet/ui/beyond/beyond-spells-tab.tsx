"use client";

import { useMemo } from "react";
import {
  PencilSquareIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import {
  ABILITY_LABELS_PT,
  formatSkillBonus,
  type AbilityScores,
  type CharacterDetail,
} from "@/entities/character";
import type { SpellSummary } from "@/entities/spell/types";
import type { CharacterCatalogLabels } from "@/features/character-sheet/api/use-character-catalog-labels";
import {
  useCastSpell,
  useCharacterState,
  usePatchCharacterState,
} from "@/features/character-sheet/api/use-character-state";
import {
  BeyondSpellRow,
  SPELL_SLOT_LEVELS,
  type SpellRowModel,
} from "@/features/character-sheet/ui/beyond/beyond-spell-row";
import { BeyondSpellSlotsPanel } from "@/features/character-sheet/ui/beyond/beyond-spell-slots-panel";
import {
  SheetEditAction,
  SheetEmptyHint,
  SheetSectionHeader,
} from "@/features/character-sheet/ui/sheet-ui";
import { useSpells } from "@/features/spell-catalog/api/use-spells";

type BeyondSpellsTabProps = {
  characterId: string;
  character: CharacterDetail;
  labels: CharacterCatalogLabels;
  onEdit?: () => void;
  cannotCastSpellsInArmor?: boolean;
};

export function BeyondSpellsTab({
  characterId,
  character,
  labels,
  onEdit,
  cannotCastSpellsInArmor = false,
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
    return SPELL_SLOT_LEVELS.filter((lv) => (state.spellSlotsMax[lv] ?? 0) > 0).map(
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
        <SheetEmptyHint>
          Nenhuma magia registrada. Use Editar para adicionar.
        </SheetEmptyHint>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SpellsTabHeader onEdit={onEdit} />

      {character.spellSaveDc != null || character.spellAttackBonus != null ? (
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {character.spellSaveDc != null ? (
            <span>
              <span className="font-semibold text-foreground">CD </span>
              <span className="font-mono tabular-nums text-foreground">
                {character.spellSaveDc}
              </span>
              {character.spellcastingAbilitySlug ? (
                <span>
                  {" "}
                  (
                  {ABILITY_LABELS_PT[
                    character.spellcastingAbilitySlug as keyof AbilityScores
                  ] ?? character.spellcastingAbilitySlug}
                  )
                </span>
              ) : null}
            </span>
          ) : null}
          {character.spellAttackBonus != null ? (
            <span>
              <span className="font-semibold text-foreground">Ataque </span>
              <span className="font-mono tabular-nums text-foreground">
                {formatSkillBonus(character.spellAttackBonus)}
              </span>
            </span>
          ) : null}
        </p>
      ) : null}

      <BeyondSpellSlotsPanel
        isPending={stateQuery.isPending}
        activeSlots={activeSlots}
        state={state}
        labels={labels}
        isClearingConcentration={patchState.isPending}
        onClearConcentration={clearConcentration}
      />

      {cannotCastSpellsInArmor ? (
        <p
          className="rounded-lg border border-secondary/35 bg-secondary/5 px-3 py-2 text-xs text-secondary"
          role="status"
        >
          Não pode conjurar com armadura ou escudo sem treino. Remova-os ou
          equipe itens para os quais tenha treino.
        </p>
      ) : null}

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
                  <BeyondSpellRow
                    key={`${row.spell.spellSlug}-${row.spell.listType}`}
                    row={row}
                    state={state}
                    casting={castSpell.isPending}
                    cannotCastSpellsInArmor={cannotCastSpellsInArmor}
                    spellSaveDc={character.spellSaveDc ?? null}
                    spellAttackBonus={character.spellAttackBonus ?? null}
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
    <SheetSectionHeader
      title="Magias"
      icon={SparklesIcon}
      action={
        onEdit ? (
          <SheetEditAction onClick={onEdit}>
            <PencilSquareIcon className="size-3" aria-hidden />
            Editar
          </SheetEditAction>
        ) : null
      }
    />
  );
}

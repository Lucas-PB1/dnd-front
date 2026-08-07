"use client";

import { useMemo, useState } from "react";
import {
  PencilSquareIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import {
  formatSkillBonus,
  type CharacterDetail,
} from "@/entities/character";
import type { SpellSummary } from "@/entities/spell/types";
import type { CharacterCatalogLabels } from "@/features/character/character-sheet/api/use-character-catalog-labels";
import {
  useCastSpell,
  useCharacterState,
  usePatchCharacterState,
} from "@/features/character/character-sheet/api/use-character-state";
import {
  BeyondSpellRow,
  MAGIC_MISSILE_FREE_RESOURCE,
  SPELL_SLOT_LEVELS,
  type SpellRowModel,
} from "@/features/character/character-sheet/ui/beyond/spells/beyond-spell-row";
import { BeyondSpellMasteryPanel } from "@/features/character/character-sheet/ui/beyond/spells/beyond-spell-mastery-panel";
import { BeyondSpellSlotsPanel } from "@/features/character/character-sheet/ui/beyond/spells/beyond-spell-slots-panel";
import {
  SPELL_MASTERY_UNLOCK_LEVEL,
  readSpellMasterySlugs,
} from "@/features/character/character-sheet/lib/spells/spell-mastery";
import {
  SheetEditAction,
  SheetEmptyHint,
  SheetSectionHeader,
} from "@/features/character/character-sheet/ui/sheet/sheet-ui";
import { useAbilityLabels } from "@/features/catalog/reference-catalog/api/use-ability-labels";
import { useSpells } from "@/features/catalog/spell-catalog/api/use-spells";

type BeyondSpellsTabProps = {
  characterId: string;
  character: CharacterDetail;
  labels: CharacterCatalogLabels;
  onEdit?: () => void;
  cannotCastSpellsInArmor?: boolean;
};

const WIZARD_LIST_SECTIONS: {
  listType: SpellRowModel["spell"]["listType"];
  title: string;
  hint: string;
}[] = [
  {
    listType: "prepared",
    title: "Preparadas hoje",
    hint: "Magias preparadas após o descanso longo",
  },
  {
    listType: "always_prepared",
    title: "Sempre preparadas",
    hint: "Concedidas pela subclasse, espécie ou talento",
  },
  {
    listType: "known",
    title: "Grimório",
    hint: "Magias no livro — prepare-as para conjurar no dia",
  },
];

export function BeyondSpellsTab({
  characterId,
  character,
  labels,
  onEdit,
  cannotCastSpellsInArmor = false,
}: BeyondSpellsTabProps) {
  const { labelOf } = useAbilityLabels();
  const stateQuery = useCharacterState(characterId);
  const patchState = usePatchCharacterState(characterId);
  const castSpell = useCastSpell(characterId);
  const spellsCatalog = useSpells();
  const [castNote, setCastNote] = useState<string | null>(null);

  const state = stateQuery.data;
  const isWizard = character.classSlug === "wizard";
  const isMissileMage = character.subclassSlug === "magic-missile-mage";
  const showSpellMastery =
    isWizard && character.level >= SPELL_MASTERY_UNLOCK_LEVEL;
  const masterySlugs = useMemo(() => {
    const { level1, level2 } = readSpellMasterySlugs(character.classOptions);
    return new Set(
      [level1, level2].filter((slug): slug is string => Boolean(slug)),
    );
  }, [character.classOptions]);

  const freeMissileUses = !isMissileMage
    ? 0
    : (state?.classResources.find(
        (item) => item.slug === MAGIC_MISSILE_FREE_RESOURCE,
      )?.remaining ?? 0);

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

  const byLevel = useMemo(() => groupRowsByLevel(rows), [rows]);

  const wizardSections = useMemo(() => {
    if (!isWizard) return [];
    return WIZARD_LIST_SECTIONS.map((section) => ({
      ...section,
      byLevel: groupRowsByLevel(
        rows.filter((row) => row.spell.listType === section.listType),
      ),
    })).filter((section) => section.byLevel.length > 0);
  }, [isWizard, rows]);

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

  async function handleCast(
    spellSlug: string,
    options?: { slotLevel?: number; freeCastResourceSlug?: string },
  ) {
    const result = await castSpell.mutateAsync({
      spellSlug,
      slotLevel: options?.slotLevel,
      freeCastResourceSlug: options?.freeCastResourceSlug,
    });
    if (result?.note?.trim()) {
      setCastNote(result.note.trim());
    }
  }

  if (character.characterSpells.length === 0) {
    return (
      <div className="space-y-3">
        <SpellsTabHeader onEdit={onEdit} />
        {character.spellSaveDc != null ||
        character.spellAttackBonus != null ||
        character.spellcastingAbilitySlug ? (
          <>
            {character.spellSaveDc != null ||
            character.spellAttackBonus != null ? (
              <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {character.spellSaveDc != null ? (
                  <span>
                    <span className="font-semibold text-foreground">CD </span>
                    <span className="font-mono tabular-nums text-foreground">
                      {character.spellSaveDc}
                    </span>
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
            <SheetEmptyHint>
              {isWizard
                ? "Grimório vazio. Use Editar para adicionar magias conhecidas e preparadas."
                : "Nenhuma magia preparada. Use Editar para adicionar."}
            </SheetEmptyHint>
          </>
        ) : (
          <SheetEmptyHint>
            Nenhuma magia registrada. Use Editar para adicionar.
          </SheetEmptyHint>
        )}
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
                  ({labelOf(character.spellcastingAbilitySlug)})
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

      {castNote ? (
        <p className="text-sm text-secondary" role="status">
          {castNote}
        </p>
      ) : null}

      {showSpellMastery ? (
        <BeyondSpellMasteryPanel
          characterId={characterId}
          character={character}
          rows={rows}
        />
      ) : null}

      {spellsCatalog.isPending && spellBySlug.size === 0 ? (
        <p className="text-sm text-muted-foreground">Carregando magias…</p>
      ) : isWizard ? (
        <div className="space-y-5">
          {wizardSections.map((section) => (
            <section key={section.listType} className="space-y-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {section.title}
                </h3>
                <p className="text-xs text-muted-foreground">{section.hint}</p>
              </div>
              {section.byLevel.map(([level, levelRows]) => (
                <SpellLevelGroup
                  key={`${section.listType}-${level}`}
                  level={level}
                  rows={levelRows}
                  state={state}
                  casting={castSpell.isPending}
                  cannotCastSpellsInArmor={cannotCastSpellsInArmor}
                  spellSaveDc={character.spellSaveDc ?? null}
                  spellAttackBonus={character.spellAttackBonus ?? null}
                  wizardLayout
                  freeMissileUses={freeMissileUses}
                  masterySlugs={masterySlugs}
                  onCast={handleCast}
                />
              ))}
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {byLevel.map(([level, levelRows]) => (
            <SpellLevelGroup
              key={level}
              level={level}
              rows={levelRows}
              state={state}
              casting={castSpell.isPending}
              cannotCastSpellsInArmor={cannotCastSpellsInArmor}
              spellSaveDc={character.spellSaveDc ?? null}
              spellAttackBonus={character.spellAttackBonus ?? null}
              freeMissileUses={freeMissileUses}
              masterySlugs={masterySlugs}
              onCast={handleCast}
            />
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

function SpellLevelGroup({
  level,
  rows,
  state,
  casting,
  cannotCastSpellsInArmor,
  spellSaveDc,
  spellAttackBonus,
  wizardLayout = false,
  freeMissileUses = 0,
  masterySlugs,
  onCast,
}: {
  level: number;
  rows: SpellRowModel[];
  state: ReturnType<typeof useCharacterState>["data"];
  casting: boolean;
  cannotCastSpellsInArmor: boolean;
  spellSaveDc: number | null;
  spellAttackBonus: number | null;
  wizardLayout?: boolean;
  freeMissileUses?: number;
  masterySlugs: Set<string>;
  onCast: (
    spellSlug: string,
    options?: { slotLevel?: number; freeCastResourceSlug?: string },
  ) => Promise<void>;
}) {
  return (
    <section className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="rounded bg-muted/70 px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold tabular-nums text-muted-foreground">
          {level < 0 ? "…" : level === 0 ? "Truques" : `${level}º`}
        </span>
        <span className="h-px flex-1 bg-border/50" aria-hidden />
      </div>
      <ul className="divide-y divide-border/40 overflow-hidden rounded-lg border border-border/70 bg-background/40">
        {rows.map((row) => (
          <BeyondSpellRow
            key={`${row.spell.spellSlug}-${row.spell.listType}`}
            row={row}
            state={state}
            casting={casting}
            cannotCastSpellsInArmor={cannotCastSpellsInArmor}
            spellSaveDc={spellSaveDc}
            spellAttackBonus={spellAttackBonus}
            wizardLayout={wizardLayout}
            freeMissileUses={freeMissileUses}
            isSpellMastery={masterySlugs.has(row.spell.spellSlug)}
            onCast={onCast}
          />
        ))}
      </ul>
    </section>
  );
}

function groupRowsByLevel(rows: SpellRowModel[]): [number, SpellRowModel[]][] {
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

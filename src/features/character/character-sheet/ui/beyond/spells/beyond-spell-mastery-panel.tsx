"use client";

import { useEffect, useMemo, useState } from "react";

import type { CharacterDetail } from "@/entities/character";
import type { ClassOption } from "@/entities/character/types";
import { usePatchCharacter } from "@/features/character/character-sheet/api/use-patch-character";
import {
  mergeSpellMasteryIntoClassOptions,
  readSpellMasterySlugs,
} from "@/features/character/character-sheet/lib/spells/spell-mastery";
import type { SpellRowModel } from "@/features/character/character-sheet/ui/beyond/spells/beyond-spell-row";
import { Button } from "@/shared/ui/button";
import { SearchableSelect } from "@/shared/ui/searchable-select";

type BeyondSpellMasteryPanelProps = {
  characterId: string;
  character: CharacterDetail;
  rows: SpellRowModel[];
};

const PREPARED_TYPES = new Set(["prepared", "always_prepared"]);

export function BeyondSpellMasteryPanel({
  characterId,
  character,
  rows,
}: BeyondSpellMasteryPanelProps) {
  const patchCharacter = usePatchCharacter(characterId);
  const saved = readSpellMasterySlugs(character.classOptions);
  const [level1, setLevel1] = useState(saved.level1 ?? "");
  const [level2, setLevel2] = useState(saved.level2 ?? "");

  useEffect(() => {
    setLevel1(saved.level1 ?? "");
    setLevel2(saved.level2 ?? "");
  }, [saved.level1, saved.level2]);

  const optionsByLevel = useMemo(() => {
    const level1Opts: { value: string; label: string }[] = [];
    const level2Opts: { value: string; label: string }[] = [];
    const seen1 = new Set<string>();
    const seen2 = new Set<string>();
    for (const row of rows) {
      if (!PREPARED_TYPES.has(row.spell.listType)) continue;
      if (row.level === 1 && !seen1.has(row.spell.spellSlug)) {
        seen1.add(row.spell.spellSlug);
        level1Opts.push({ value: row.spell.spellSlug, label: row.name });
      }
      if (row.level === 2 && !seen2.has(row.spell.spellSlug)) {
        seen2.add(row.spell.spellSlug);
        level2Opts.push({ value: row.spell.spellSlug, label: row.name });
      }
    }
    level1Opts.sort((a, b) => a.label.localeCompare(b.label, "pt"));
    level2Opts.sort((a, b) => a.label.localeCompare(b.label, "pt"));
    return { level1Opts, level2Opts };
  }, [rows]);

  const dirty =
    (level1 || null) !== saved.level1 || (level2 || null) !== saved.level2;

  async function save() {
    const next = mergeSpellMasteryIntoClassOptions(
      (character.classOptions ?? []) as ClassOption[],
      {
        level1: level1 || null,
        level2: level2 || null,
      },
    );
    await patchCharacter.mutateAsync({ classOptions: next });
  }

  return (
    <section
      className="space-y-2 rounded-xl border border-border/50 bg-card/40 p-3"
      aria-labelledby="spell-mastery-heading"
    >
      <div>
        <h3
          id="spell-mastery-heading"
          className="text-sm font-semibold text-foreground"
        >
          Dominância de Magias
        </h3>
        <p className="text-xs text-muted-foreground">
          Escolha 1 magia de 1º e 1 de 2º (preparadas). Conjure-as à vontade sem
          gastar espaço. Pode trocar após um Descanso Longo.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <label
            className="text-[0.65rem] font-medium text-muted-foreground"
            htmlFor="spell-mastery-1"
          >
            1º círculo
          </label>
          <SearchableSelect
            id="spell-mastery-1"
            className="h-8 text-xs"
            value={level1}
            placeholder="Nenhuma"
            options={[
              { value: "", label: "Nenhuma" },
              ...optionsByLevel.level1Opts,
            ]}
            onValueChange={setLevel1}
            disabled={patchCharacter.isPending}
          />
        </div>
        <div className="space-y-1">
          <label
            className="text-[0.65rem] font-medium text-muted-foreground"
            htmlFor="spell-mastery-2"
          >
            2º círculo
          </label>
          <SearchableSelect
            id="spell-mastery-2"
            className="h-8 text-xs"
            value={level2}
            placeholder="Nenhuma"
            options={[
              { value: "", label: "Nenhuma" },
              ...optionsByLevel.level2Opts,
            ]}
            onValueChange={setLevel2}
            disabled={patchCharacter.isPending}
          />
        </div>
      </div>
      {optionsByLevel.level1Opts.length === 0 &&
      optionsByLevel.level2Opts.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Prepare magias de 1º e 2º círculo para poder escolhê-las aqui.
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={!dirty || patchCharacter.isPending}
          onClick={() => void save()}
        >
          Salvar escolhas
        </Button>
        {patchCharacter.isError ? (
          <p className="text-xs text-destructive" role="alert">
            {patchCharacter.error instanceof Error
              ? patchCharacter.error.message
              : "Não foi possível salvar"}
          </p>
        ) : null}
      </div>
    </section>
  );
}

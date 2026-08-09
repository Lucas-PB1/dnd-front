"use client";

import { useMemo, useState } from "react";

import type { EldritchInvocation } from "@/features/catalog/eldritch-invocation-catalog/api/eldritch-invocations.api";
import { warlockInvocationLimit } from "@/features/character/character-sheet/lib/warlock/eldritch-invocations";
import { Button } from "@/shared/ui/button";
import { SearchableSelect } from "@/shared/ui/searchable-select";

type EldritchInvocationPickerProps = {
  level: number;
  catalog: readonly EldritchInvocation[];
  selectedSlugs: readonly string[];
  onChange: (slugs: string[]) => void;
  disabled?: boolean;
};

export function EldritchInvocationPicker({
  level,
  catalog,
  selectedSlugs,
  onChange,
  disabled = false,
}: EldritchInvocationPickerProps) {
  const limit = warlockInvocationLimit(level);
  const [draft, setDraft] = useState("");

  const bySlug = useMemo(
    () => new Map(catalog.map((row) => [row.slug, row])),
    [catalog],
  );

  const selectedSet = useMemo(() => new Set(selectedSlugs), [selectedSlugs]);
  const hasPact = (slug: string) => selectedSet.has(slug);

  const options = useMemo(() => {
    return catalog
      .filter((row) => {
        if (row.minLevel > level) return false;
        if (!row.repeatable && selectedSet.has(row.slug)) return false;
        if (row.requiresPactSlug && !hasPact(row.requiresPactSlug)) return false;
        if (
          row.requiresInvocationSlug &&
          !selectedSet.has(row.requiresInvocationSlug)
        ) {
          return false;
        }
        return true;
      })
      .map((row) => ({
        value: row.slug,
        label: `${row.name} (nv. ${row.minLevel}+)`,
      }));
  }, [catalog, level, selectedSet, selectedSlugs]);

  function add() {
    if (!draft || selectedSlugs.length >= limit) return;
    onChange([...selectedSlugs, draft]);
    setDraft("");
  }

  function removeAt(index: number) {
    onChange(selectedSlugs.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Escolha até {limit} invocação(ões) para o nível {level}. Pactos (Tomo /
        Lâmina / Corrente) também contam nesse limite.
      </p>

      <ul className="space-y-1.5">
        {selectedSlugs.length === 0 ? (
          <li className="text-xs text-muted-foreground">Nenhuma invocação.</li>
        ) : (
          selectedSlugs.map((slug, index) => {
            const row = bySlug.get(slug);
            return (
              <li
                key={`${slug}-${index}`}
                className="flex items-start justify-between gap-2 rounded-md border border-border/40 px-2 py-1.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{row?.name ?? slug}</p>
                  {row?.description ? (
                    <p className="text-[0.7rem] text-muted-foreground line-clamp-2">
                      {row.description}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  disabled={disabled}
                  onClick={() => removeAt(index)}
                >
                  Remover
                </Button>
              </li>
            );
          })
        )}
      </ul>

      {selectedSlugs.length < limit ? (
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[14rem] flex-1 space-y-1">
            <label className="text-[0.65rem] font-medium text-muted-foreground">
              Adicionar invocação
            </label>
            <SearchableSelect
              value={draft}
              onValueChange={setDraft}
              options={options}
              placeholder="Buscar…"
              disabled={disabled}
            />
          </div>
          <Button
            type="button"
            size="sm"
            disabled={disabled || !draft}
            onClick={add}
          >
            Adicionar
          </Button>
        </div>
      ) : null}
    </div>
  );
}

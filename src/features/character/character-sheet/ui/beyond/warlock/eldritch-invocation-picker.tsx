"use client";

import { useMemo, useState } from "react";

import type { EldritchInvocation } from "@/features/catalog/eldritch-invocation-catalog/api/eldritch-invocations.api";
import {
  isBlastInvocationSlug,
  warlockInvocationLimit,
  type EldritchInvocationPick,
} from "@/features/character/character-sheet/lib/warlock/eldritch-invocations";
import { Button } from "@/shared/ui/button";
import { SearchableSelect } from "@/shared/ui/searchable-select";

export type EldritchCantripOption = {
  value: string;
  label: string;
  /** Heurística client-side alinhada à API (ataque / dano / alcance). */
  requiresAttackRoll?: boolean;
  dealsDamage?: boolean;
  rangeMeters?: number | null;
};

type EldritchInvocationPickerProps = {
  level: number;
  catalog: readonly EldritchInvocation[];
  selectedPicks: readonly EldritchInvocationPick[];
  cantripOptions?: readonly EldritchCantripOption[];
  onChange: (picks: EldritchInvocationPick[]) => void;
  disabled?: boolean;
};

function cantripEligible(
  invocationSlug: string,
  option: EldritchCantripOption,
): boolean {
  if (invocationSlug === "repelling-blast") {
    return Boolean(option.requiresAttackRoll);
  }
  if (invocationSlug === "eldritch-spear") {
    return (
      Boolean(option.dealsDamage) &&
      option.rangeMeters != null &&
      option.rangeMeters >= 3
    );
  }
  if (invocationSlug === "agonizing-blast") {
    return Boolean(option.dealsDamage);
  }
  return true;
}

export function EldritchInvocationPicker({
  level,
  catalog,
  selectedPicks,
  cantripOptions = [],
  onChange,
  disabled = false,
}: EldritchInvocationPickerProps) {
  const limit = warlockInvocationLimit(level);
  const [draft, setDraft] = useState("");

  const bySlug = useMemo(
    () => new Map(catalog.map((row) => [row.slug, row])),
    [catalog],
  );

  const selectedSlugs = selectedPicks.map((pick) => pick.slug);
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
    if (!draft || selectedPicks.length >= limit) return;
    const next: EldritchInvocationPick = { slug: draft };
    if (isBlastInvocationSlug(draft)) {
      const eligible = cantripOptions.filter((option) =>
        cantripEligible(draft, option),
      );
      next.cantripSlug = eligible[0]?.value ?? null;
    }
    onChange([...selectedPicks, next]);
    setDraft("");
  }

  function removeAt(index: number) {
    onChange(selectedPicks.filter((_, i) => i !== index));
  }

  function setCantripAt(index: number, cantripSlug: string) {
    onChange(
      selectedPicks.map((pick, i) =>
        i === index ? { ...pick, cantripSlug } : pick,
      ),
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Escolha até {limit} invocação(ões) para o nível {level}. Pactos (Tomo /
        Lâmina / Corrente) também contam nesse limite. Explosão Agonizante /
        Repulsiva / Lança Mística exigem um truque de Bruxo vinculado.
      </p>

      <ul className="space-y-1.5">
        {selectedPicks.length === 0 ? (
          <li className="text-xs text-muted-foreground">Nenhuma invocação.</li>
        ) : (
          selectedPicks.map((pick, index) => {
            const row = bySlug.get(pick.slug);
            const needsCantrip = isBlastInvocationSlug(pick.slug);
            const eligibleCantrips = cantripOptions.filter((option) =>
              cantripEligible(pick.slug, option),
            );
            return (
              <li
                key={`${pick.slug}-${index}`}
                className="space-y-2 rounded-md border border-border/40 px-2 py-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{row?.name ?? pick.slug}</p>
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
                </div>
                {needsCantrip ? (
                  <div className="space-y-1">
                    <label className="text-[0.65rem] font-medium text-muted-foreground">
                      Truque vinculado
                    </label>
                    <SearchableSelect
                      value={pick.cantripSlug ?? ""}
                      onValueChange={(value) => setCantripAt(index, value)}
                      options={eligibleCantrips.map((option) => ({
                        value: option.value,
                        label: option.label,
                      }))}
                      placeholder={
                        eligibleCantrips.length === 0
                          ? "Nenhum truque elegível na ficha"
                          : "Escolher truque…"
                      }
                      disabled={disabled || eligibleCantrips.length === 0}
                    />
                  </div>
                ) : null}
              </li>
            );
          })
        )}
      </ul>

      {selectedPicks.length < limit ? (
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

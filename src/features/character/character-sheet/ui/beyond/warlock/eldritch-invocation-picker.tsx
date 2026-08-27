"use client";

import { useMemo, useState } from "react";

import type { EldritchInvocation } from "@/features/catalog/eldritch-invocation-catalog/api/eldritch-invocations.api";
import {
  isBlastInvocationSlug,
  isLessonsOfTheFirstOnesSlug,
  warlockInvocationLimit,
  type EldritchInvocationPick,
} from "@/features/character/character-sheet/lib/warlock/eldritch-invocations";
import { Button } from "@/shared/ui/button";
import { PhbProse } from "@/shared/ui/phb-prose";
import { SearchableSelect } from "@/shared/ui/searchable-select";

function truncateHint(text: string | null | undefined, maxChars = 72) {
  const trimmed = text?.trim();
  if (!trimmed) return undefined;
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars).trim()}…`;
}

export type EldritchCantripOption = {
  value: string;
  label: string;
  /** Heurística client-side alinhada à API (ataque / dano / alcance). */
  requiresAttackRoll?: boolean;
  dealsDamage?: boolean;
  rangeMeters?: number | null;
};

export type EldritchOriginFeatOption = {
  value: string;
  label: string;
};

type EldritchInvocationPickerProps = {
  level: number;
  catalog: readonly EldritchInvocation[];
  selectedPicks: readonly EldritchInvocationPick[];
  cantripOptions?: readonly EldritchCantripOption[];
  originFeatOptions?: readonly EldritchOriginFeatOption[];
  /** Talentos já na ficha (exceto os desta invocação) — indisponíveis. */
  occupiedOriginFeatSlugs?: ReadonlySet<string>;
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
  originFeatOptions = [],
  occupiedOriginFeatSlugs,
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

  const selectedOriginFeats = useMemo(() => {
    const set = new Set<string>();
    for (const pick of selectedPicks) {
      if (pick.originFeatSlug) set.add(pick.originFeatSlug);
    }
    return set;
  }, [selectedPicks]);

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
        hint: truncateHint(row.description),
      }));
  }, [catalog, level, selectedSet, selectedSlugs]);

  function eligibleOriginFeatsFor(index: number) {
    const current = selectedPicks[index]?.originFeatSlug ?? null;
    return originFeatOptions.filter((option) => {
      if (option.value === current) return true;
      if (selectedOriginFeats.has(option.value)) return false;
      if (occupiedOriginFeatSlugs?.has(option.value)) return false;
      return true;
    });
  }

  function add() {
    if (!draft || selectedPicks.length >= limit) return;
    const next: EldritchInvocationPick = { slug: draft };
    if (isBlastInvocationSlug(draft)) {
      const eligible = cantripOptions.filter((option) =>
        cantripEligible(draft, option),
      );
      next.cantripSlug = eligible[0]?.value ?? null;
    }
    if (isLessonsOfTheFirstOnesSlug(draft)) {
      const eligible = originFeatOptions.filter((option) => {
        if (selectedOriginFeats.has(option.value)) return false;
        if (occupiedOriginFeatSlugs?.has(option.value)) return false;
        return true;
      });
      next.originFeatSlug = eligible[0]?.value ?? null;
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

  function setOriginFeatAt(index: number, originFeatSlug: string) {
    onChange(
      selectedPicks.map((pick, i) =>
        i === index ? { ...pick, originFeatSlug } : pick,
      ),
    );
  }

  const draftRow = draft ? bySlug.get(draft) : undefined;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Escolha até {limit} invocação(ões) para o nível {level}. Pactos (Tomo /
        Lâmina / Corrente) também contam nesse limite. Explosão Agonizante /
        Repulsiva / Lança Mística exigem um truque vinculado. Lições dos
        Primeiros exige um talento de Origem.
      </p>

      <ul className="space-y-1.5">
        {selectedPicks.length === 0 ? (
          <li className="text-xs text-muted-foreground">Nenhuma invocação.</li>
        ) : (
          selectedPicks.map((pick, index) => {
            const row = bySlug.get(pick.slug);
            const needsCantrip = isBlastInvocationSlug(pick.slug);
            const needsOriginFeat = isLessonsOfTheFirstOnesSlug(pick.slug);
            const eligibleCantrips = cantripOptions.filter((option) =>
              cantripEligible(pick.slug, option),
            );
            const eligibleOriginFeats = eligibleOriginFeatsFor(index);
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
                {needsOriginFeat ? (
                  <div className="space-y-1">
                    <label className="text-[0.65rem] font-medium text-muted-foreground">
                      Talento de Origem
                    </label>
                    <SearchableSelect
                      value={pick.originFeatSlug ?? ""}
                      onValueChange={(value) => setOriginFeatAt(index, value)}
                      options={eligibleOriginFeats.map((option) => ({
                        value: option.value,
                        label: option.label,
                      }))}
                      placeholder={
                        eligibleOriginFeats.length === 0
                          ? "Nenhum talento de Origem disponível"
                          : "Escolher talento…"
                      }
                      disabled={disabled || eligibleOriginFeats.length === 0}
                    />
                  </div>
                ) : null}
              </li>
            );
          })
        )}
      </ul>

      {selectedPicks.length < limit ? (
        <div className="space-y-1.5">
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
          {draftRow?.description ? (
            <div className="rounded-md border border-border/50 bg-muted/15 px-2.5 py-2">
              <p className="text-xs font-medium">{draftRow.name}</p>
              <PhbProse
                text={draftRow.description}
                className="mt-0.5 text-xs leading-snug text-muted-foreground [&_p]:my-0"
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

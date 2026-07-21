"use client";

import { useMemo, useState } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { BookOpenIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { isSubclassRequired } from "@/entities/character/lib/subclass";
import type { ClassSpellOption } from "@/entities/class/types";
import {
  resolveSpellcastingUiProfile,
  spellsForView,
  type SpellListView,
} from "@/features/create-character/lib/class-spellcasting-ui";
import {
  classSpellcastingMode,
  countSpellsByType,
  filterClassSpells,
  formatSpellSlotsForLevel,
  toggleCantrip,
  toggleLeveledSpell,
  toggleSubclassSpell,
  wizardSpellbookLimitAtLevel,
} from "@/features/create-character/lib/wizard-spell-selection";
import { wizardMaxSpellLevelForLevel } from "@/features/create-character/lib/wizard-spell-step";
import { resolveLevelProgression } from "@/features/create-character/lib/resolve-level-progression";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import {
  SpellPreviewDialog,
  type SpellPreviewAction,
} from "@/features/create-character/ui/spell-preview-dialog";
import { WizardFormSection } from "@/features/create-character/ui/wizard-form-section";
import {
  useClassDetail,
  useClassProgression,
  useClassSpells,
  useClassSpellSlots,
  useSubclassSpells,
} from "@/features/class-catalog/api/use-classes";
import { CatalogFilters } from "@/shared/ui/catalog-filters";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type StepSpellsProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
};

const LIST_VIEWS: { id: SpellListView; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "cantrips", label: "Truques" },
  { id: "leveled", label: "Magias" },
  { id: "selected", label: "Selecionadas" },
];

type PreviewTarget = {
  slug: string;
  kind: "cantrip" | "leveled" | "subclass";
};

export function StepSpells({ control, setValue }: StepSpellsProps) {
  const level = useWatch({ control, name: "level", defaultValue: 1 });
  const classSlug = useWatch({ control, name: "classSlug", defaultValue: "" });
  const subclassSlug = useWatch({
    control,
    name: "subclassSlug",
    defaultValue: "",
  });
  const characterSpells = useWatch({
    control,
    name: "characterSpells",
    defaultValue: [],
  });

  const [search, setSearch] = useState("");
  const [schoolSlug, setSchoolSlug] = useState("");
  const [circle, setCircle] = useState("");
  const [listView, setListView] = useState<SpellListView>("all");
  const [hint, setHint] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewTarget | null>(null);

  const maxLevel = wizardMaxSpellLevelForLevel(level);
  const mode = classSpellcastingMode(classSlug);

  const classDetail = useClassDetail(classSlug, !!classSlug);
  const classSpells = useClassSpells(classSlug, maxLevel, !!classSlug);
  const spellSlotsQuery = useClassSpellSlots(classSlug, !!classSlug);
  const progressionQuery = useClassProgression(classSlug, !!classSlug);
  const subclassSpells = useSubclassSpells(
    subclassSlug ?? "",
    isSubclassRequired(level) && !!subclassSlug,
  );

  const availableClass = classSpells.data?.data ?? [];
  const availableSubclass = (subclassSpells.data?.data ?? []).filter(
    (s) => s.unlockLevel <= level,
  );

  const slotRow = (spellSlotsQuery.data?.data ?? []).find(
    (row) => row.classLevel === level,
  );
  const progressionRow = resolveLevelProgression(
    level,
    (progressionQuery.data?.data ?? []).find((row) => row.level === level),
    slotRow,
  );
  const slotLines = formatSpellSlotsForLevel(slotRow?.spellSlots);

  const uiProfile = resolveSpellcastingUiProfile(
    classSlug,
    slotRow?.patternSlug,
    mode,
    progressionRow,
  );

  const cantripMax = progressionRow?.cantrips ?? null;
  const leveledPreparedMax = progressionRow?.preparedSpells ?? null;
  const leveledKnownMax =
    mode === "wizard"
      ? wizardSpellbookLimitAtLevel(level, leveledPreparedMax)
      : mode === "known"
        ? leveledPreparedMax
        : null;

  const counts = useMemo(
    () => countSpellsByType(characterSpells, availableClass),
    [characterSpells, availableClass],
  );

  const atCantripLimit =
    cantripMax != null && counts.cantrips >= cantripMax;
  const atLeveledKnownLimit =
    leveledKnownMax != null && counts.leveledKnown >= leveledKnownMax;
  const atLeveledPreparedLimit =
    leveledPreparedMax != null && counts.leveledPrepared >= leveledPreparedMax;

  const selectedSlugs = useMemo(
    () => new Set(characterSpells.map((s) => s.spellSlug)),
    [characterSpells],
  );

  const schools = useMemo(() => {
    const map = new Map<string, string>();
    for (const spell of availableClass) {
      map.set(spell.schoolSlug, spell.schoolName);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "pt"));
  }, [availableClass]);

  const circleOptions = useMemo(() => {
    const levels = new Set(availableClass.map((s) => s.level));
    return [...levels].sort((a, b) => a - b);
  }, [availableClass]);

  const hasActiveFilters = Boolean(search.trim() || schoolSlug || circle);

  const filtered = useMemo(
    () =>
      filterClassSpells(availableClass, {
        q: search,
        schoolSlug,
        circle,
      }),
    [availableClass, search, schoolSlug, circle],
  );

  const cantripList = filtered.filter((s) => s.level === 0);
  const leveledList = filtered.filter((s) => s.level > 0);

  const visibleSpells = useMemo(() => {
    const base = spellsForView(
      listView,
      cantripList,
      leveledList,
      filtered,
      selectedSlugs,
    );
    return base as ClassSpellOption[];
  }, [listView, cantripList, leveledList, filtered, selectedSlugs]);

  const visibleCantrips = visibleSpells.filter((s) => s.level === 0);
  const visibleLeveled = visibleSpells.filter((s) => s.level > 0);

  function applySpells(next: typeof characterSpells) {
    setHint(null);
    setValue("characterSpells", next);
  }

  function onCantrip(spell: ClassSpellOption) {
    const result = toggleCantrip(
      characterSpells,
      spell,
      availableClass,
      cantripMax,
    );
    if (!result.ok) {
      setHint(result.reason);
      return;
    }
    applySpells(result.next);
  }

  function onLeveled(spell: ClassSpellOption, intent: "known" | "prepared") {
    const result = toggleLeveledSpell(
      characterSpells,
      spell,
      availableClass,
      mode,
      { leveledKnownMax, leveledPreparedMax },
      intent,
    );
    if (!result.ok) {
      setHint(result.reason);
      return;
    }
    applySpells(result.next);
  }

  function onSubclass(slug: string) {
    applySpells(toggleSubclassSpell(characterSpells, slug));
  }

  function clearFilters() {
    setSearch("");
    setSchoolSlug("");
    setCircle("");
  }

  function previewActions(target: PreviewTarget): SpellPreviewAction[] {
    if (target.kind === "subclass") {
      const selected = selectedSlugs.has(target.slug);
      return [
        {
          label: selected ? "Remover seleção" : "Selecionar",
          variant: selected ? "outline" : "default",
          onClick: () => onSubclass(target.slug),
        },
      ];
    }

    const spell = availableClass.find((s) => s.slug === target.slug);
    if (!spell) return [];

    if (target.kind === "cantrip") {
      const selected = selectedSlugs.has(spell.slug);
      return [
        {
          label: selected ? "Remover seleção" : "Selecionar",
          variant: selected ? "outline" : "default",
          disabled: !selected && atCantripLimit,
          onClick: () => onCantrip(spell),
        },
      ];
    }

    if (uiProfile.showWizardDualPick) {
      const entry = characterSpells.find((s) => s.spellSlug === spell.slug);
      const inBook =
        entry?.listType === "known" || entry?.listType === "prepared";
      const prepared = entry?.listType === "prepared";
      const actions: SpellPreviewAction[] = [
        {
          label: inBook ? "Remover do grimório" : "Adicionar ao grimório",
          variant: inBook ? "outline" : "default",
          disabled: !inBook && atLeveledKnownLimit,
          onClick: () => onLeveled(spell, "known"),
        },
      ];
      if (inBook) {
        actions.push({
          label: prepared ? "Despreparar" : "Preparar",
          variant: "secondary",
          disabled: !prepared && atLeveledPreparedLimit,
          onClick: () => onLeveled(spell, "prepared"),
        });
      }
      return actions;
    }

    const selected = selectedSlugs.has(spell.slug);
    const atLimit =
      mode === "known" ? atLeveledKnownLimit : atLeveledPreparedLimit;
    return [
      {
        label: selected ? "Remover seleção" : "Selecionar",
        variant: selected ? "outline" : "default",
        disabled: !selected && atLimit,
        onClick: () =>
          onLeveled(spell, mode === "known" ? "known" : "prepared"),
      },
    ];
  }

  if (
    classSpells.isPending ||
    spellSlotsQuery.isPending ||
    progressionQuery.isPending
  ) {
    return <p className="text-sm text-muted-foreground">Carregando magias…</p>;
  }

  if (availableClass.length === 0 && availableSubclass.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta combinação classe/nível não exige escolha de magias na criação.
      </p>
    );
  }

  const className = classDetail.data?.name ?? "Classe";

  return (
    <div className="space-y-3">
      <WizardFormSection title={`${className} · nv. ${level}`} compact>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            {uiProfile.archetypeTitle}
          </span>
          {slotRow?.patternName ? (
            <span className="text-xs text-muted-foreground">
              {slotRow.patternName}
            </span>
          ) : null}
        </div>

        <SpellResourcesPanel
          profile={uiProfile}
          counts={counts}
          cantripMax={cantripMax}
          leveledKnownMax={leveledKnownMax}
          leveledPreparedMax={leveledPreparedMax}
          channelMax={progressionRow?.channelDivinity ?? null}
          slotLines={slotLines}
          patternSlug={slotRow?.patternSlug}
        />
      </WizardFormSection>

      {hint ? (
        <p className="text-sm text-destructive" role="alert">
          {hint}
        </p>
      ) : null}

      {availableClass.length > 0 &&
      cantripMax == null &&
      leveledPreparedMax == null &&
      leveledKnownMax == null ? (
        <p className="text-sm text-destructive" role="alert">
          Cotas de magia não carregaram para esta classe. Recarregue a página;
          sem cotas a seleção fica sem limite.
        </p>
      ) : null}

      {availableClass.length > 0 ? (
        <WizardFormSection title="Lista de magias" compact>
          <div className="space-y-1.5">
            <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
              Visualização
            </p>
            <div
              className="flex flex-wrap gap-1 rounded-lg border bg-muted/20 p-1"
              role="tablist"
              aria-label="Visualização da lista"
            >
              {LIST_VIEWS.filter((tab) => {
                if (tab.id === "cantrips" && !uiProfile.showCantripPicker) {
                  return false;
                }
                return true;
              }).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={listView === tab.id}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                    listView === tab.id
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                  )}
                  onClick={() => setListView(tab.id)}
                >
                  {tab.label}
                  {tab.id === "selected" ? ` (${selectedSlugs.size})` : null}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-dashed border-border/80 bg-muted/15 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
                Filtros
              </p>
              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="h-6 gap-1 text-muted-foreground"
                  onClick={clearFilters}
                >
                  <XMarkIcon className="size-3.5" aria-hidden />
                  Limpar
                </Button>
              ) : null}
            </div>

            <CatalogSearch
              value={search}
              onChange={setSearch}
              placeholder="Buscar por nome…"
              resultCount={filtered.length}
            />

            <CatalogFilters
              fields={[
                {
                  key: "school",
                  label: "Escola",
                  allLabel: "Todas",
                  options: schools.map(([slug, name]) => ({
                    value: slug,
                    label: name,
                  })),
                },
                {
                  key: "circle",
                  label: "Círculo",
                  allLabel: "Todos",
                  options: circleOptions.map((lv) => ({
                    value: String(lv),
                    label: lv === 0 ? "Truques" : `Círculo ${lv}`,
                  })),
                },
              ]}
              values={{ school: schoolSlug, circle }}
              onChange={(key, value) => {
                if (key === "school") setSchoolSlug(value);
                if (key === "circle") setCircle(value);
              }}
            />
          </div>

          {uiProfile.showCantripPicker && visibleCantrips.length > 0 ? (
            <SpellBlock title="Truques">
              {visibleCantrips.map((spell) => (
                <SimpleSpellRow
                  key={spell.slug}
                  spell={spell}
                  checked={selectedSlugs.has(spell.slug)}
                  disabled={!selectedSlugs.has(spell.slug) && atCantripLimit}
                  onToggle={() => onCantrip(spell)}
                  onPreview={() =>
                    setPreview({ slug: spell.slug, kind: "cantrip" })
                  }
                />
              ))}
            </SpellBlock>
          ) : null}

          {visibleLeveled.length > 0 ? (
            <SpellBlock title={uiProfile.leveledSectionTitle}>
              {visibleLeveled.map((spell) =>
                uiProfile.showWizardDualPick ? (
                  <WizardSpellRow
                    key={spell.slug}
                    spell={spell}
                    entry={characterSpells.find(
                      (s) => s.spellSlug === spell.slug,
                    )}
                    knownDisabled={
                      !selectedSlugs.has(spell.slug) && atLeveledKnownLimit
                    }
                    preparedDisabled={
                      !(
                        characterSpells.find((s) => s.spellSlug === spell.slug)
                          ?.listType === "prepared"
                      ) && atLeveledPreparedLimit
                    }
                    onKnown={() => onLeveled(spell, "known")}
                    onPrepared={() => onLeveled(spell, "prepared")}
                    onPreview={() =>
                      setPreview({ slug: spell.slug, kind: "leveled" })
                    }
                  />
                ) : (
                  <SimpleSpellRow
                    key={spell.slug}
                    spell={spell}
                    checked={selectedSlugs.has(spell.slug)}
                    disabled={
                      !selectedSlugs.has(spell.slug) &&
                      (mode === "known"
                        ? atLeveledKnownLimit
                        : atLeveledPreparedLimit)
                    }
                    onToggle={() =>
                      onLeveled(
                        spell,
                        mode === "known" ? "known" : "prepared",
                      )
                    }
                    onPreview={() =>
                      setPreview({ slug: spell.slug, kind: "leveled" })
                    }
                  />
                ),
              )}
            </SpellBlock>
          ) : null}

          {visibleSpells.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma magia nesta visualização.
            </p>
          ) : null}
        </WizardFormSection>
      ) : null}

      {availableSubclass.length > 0 ? (
        <WizardFormSection title="Subclasse" compact>
          <ul className="grid gap-2 sm:grid-cols-2">
            {availableSubclass.map((spell) => (
              <li key={spell.slug} className="list-none">
                <div
                  className={cn(
                    "flex items-start gap-2 rounded-lg border px-2.5 py-2 text-sm",
                    selectedSlugs.has(spell.slug) &&
                      "border-primary bg-primary/5",
                  )}
                >
                  <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selectedSlugs.has(spell.slug)}
                      onChange={() => onSubclass(spell.slug)}
                    />
                    <span>
                      {spell.name}
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Desbloqueio nv. {spell.unlockLevel}
                      </span>
                    </span>
                  </label>
                  <PreviewButton
                    onClick={() =>
                      setPreview({ slug: spell.slug, kind: "subclass" })
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        </WizardFormSection>
      ) : null}

      <SpellPreviewDialog
        slug={preview?.slug ?? null}
        open={preview != null}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
        actions={preview ? previewActions(preview) : []}
      />
    </div>
  );
}

function SpellResourcesPanel({
  profile,
  counts,
  cantripMax,
  leveledKnownMax,
  leveledPreparedMax,
  channelMax,
  slotLines,
  patternSlug,
}: {
  profile: ReturnType<typeof resolveSpellcastingUiProfile>;
  counts: ReturnType<typeof countSpellsByType>;
  cantripMax: number | null;
  leveledKnownMax: number | null;
  leveledPreparedMax: number | null;
  channelMax: number | null;
  slotLines: { level: string; count: number }[];
  patternSlug?: string;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="space-y-2 rounded-lg border p-3">
        <p className="text-xs font-medium">Cotas</p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {profile.showCantripPicker && cantripMax != null ? (
            <QuotaMeter
              label={profile.cantripQuotaLabel}
              used={counts.cantrips}
              max={cantripMax}
            />
          ) : null}
          <QuotaMeter
            label={profile.leveledPrimaryQuotaLabel}
            used={
              profile.showWizardDualPick
                ? counts.leveledKnown
                : profile.leveledPrimaryQuotaLabel
                      .toLowerCase()
                      .includes("preparad")
                  ? counts.leveledPrepared
                  : counts.leveledKnown
            }
            max={
              profile.showWizardDualPick
                ? leveledKnownMax
                : profile.leveledPrimaryQuotaLabel
                      .toLowerCase()
                      .includes("preparad")
                  ? leveledPreparedMax
                  : leveledKnownMax
            }
          />
          {profile.leveledSecondaryQuotaLabel ? (
            <QuotaMeter
              label={profile.leveledSecondaryQuotaLabel}
              used={counts.leveledPrepared}
              max={leveledPreparedMax}
            />
          ) : null}
          {profile.extraResourceLabel && channelMax != null && channelMax > 0 ? (
            <p className="text-[11px] text-muted-foreground sm:col-span-2">
              {profile.extraResourceLabel}: {channelMax}/descanso
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5 rounded-lg border p-3">
        <p className="text-xs font-medium">Espaços</p>
        {slotLines.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {slotLines.map(({ level, count }) => (
              <div
                key={level}
                className={cn(
                  "flex min-w-[3.5rem] flex-col items-center rounded-md border px-1.5 py-1 text-center",
                  patternSlug === "pact" && "border-primary/40 bg-primary/5",
                )}
              >
                <span className="text-[10px] text-muted-foreground">
                  {patternSlug === "pact" ? "Pacto" : `C${level}`}
                </span>
                <span className="text-base font-semibold tabular-nums">
                  {count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Sem espaços neste nível.</p>
        )}
      </div>
    </div>
  );
}

function QuotaMeter({
  label,
  used,
  max,
}: {
  label: string;
  used: number;
  max: number | null;
}) {
  const ratio = max != null && max > 0 ? Math.min(used / max, 1) : 0;
  const over = max != null && used > max;

  return (
    <div className="space-y-1.5 rounded-lg border px-3 py-2">
      <div className="flex justify-between gap-2 text-xs">
        <span className="font-medium">{label}</span>
        <span className={cn(over && "text-destructive", "tabular-nums")}>
          {used}
          {max != null ? ` / ${max}` : " / —"}
        </span>
      </div>
      {max != null ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              over ? "bg-destructive" : "bg-primary",
            )}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function SpellBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium">{title}</p>
      <ul className="grid gap-1.5 sm:grid-cols-2">{children}</ul>
    </div>
  );
}

function SpellMeta({ spell }: { spell: ClassSpellOption }) {
  return (
    <span className="min-w-0">
      <span className="font-medium">{spell.name}</span>
      <span className="mt-0.5 block text-xs text-muted-foreground">
        {spell.level === 0 ? "Truque" : `Círculo ${spell.level}`} ·{" "}
        {spell.schoolName}
      </span>
    </span>
  );
}

function PreviewButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
      aria-label="Ver descrição da magia"
      onClick={onClick}
    >
      <BookOpenIcon className="size-3.5" aria-hidden />
    </Button>
  );
}

function SimpleSpellRow({
  spell,
  checked,
  disabled = false,
  onToggle,
  onPreview,
}: {
  spell: ClassSpellOption;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onPreview: () => void;
}) {
  return (
    <li className="list-none">
      <div
        className={cn(
          "flex h-full items-start gap-1 rounded-lg border px-2 py-2 text-sm",
          checked && "border-primary bg-primary/5",
          disabled && "opacity-50",
        )}
      >
        <label
          className={cn(
            "flex min-w-0 flex-1 items-start gap-2 px-1 py-0.5",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
        >
          <input
            type="checkbox"
            className="mt-1"
            checked={checked}
            disabled={disabled}
            onChange={onToggle}
          />
          <SpellMeta spell={spell} />
        </label>
        <PreviewButton onClick={onPreview} />
      </div>
    </li>
  );
}

function WizardSpellRow({
  spell,
  entry,
  knownDisabled = false,
  preparedDisabled = false,
  onKnown,
  onPrepared,
  onPreview,
}: {
  spell: ClassSpellOption;
  entry?: { listType: string };
  knownDisabled?: boolean;
  preparedDisabled?: boolean;
  onKnown: () => void;
  onPrepared: () => void;
  onPreview: () => void;
}) {
  const inBook =
    entry?.listType === "known" || entry?.listType === "prepared";
  const prepared = entry?.listType === "prepared";

  return (
    <li className="list-none sm:col-span-2">
      <div
        className={cn(
          "flex flex-col gap-3 rounded-lg border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between",
          inBook && "border-primary/50 bg-primary/5",
          knownDisabled && !inBook && "opacity-50",
        )}
      >
        <div className="flex min-w-0 items-start gap-1">
          <SpellMeta spell={spell} />
          <PreviewButton onClick={onPreview} />
        </div>
        <div className="flex shrink-0 gap-3 text-xs">
          <label
            className={cn(
              "flex items-center gap-1.5",
              knownDisabled && !inBook && "cursor-not-allowed",
            )}
          >
            <input
              type="checkbox"
              checked={inBook}
              disabled={knownDisabled && !inBook}
              onChange={onKnown}
            />
            Grimório
          </label>
          <label
            className={cn(
              "flex items-center gap-1.5",
              (!inBook || (preparedDisabled && !prepared)) && "opacity-40",
            )}
          >
            <input
              type="checkbox"
              checked={prepared}
              disabled={!inBook || (preparedDisabled && !prepared)}
              onChange={onPrepared}
            />
            Preparada
          </label>
        </div>
      </div>
    </li>
  );
}

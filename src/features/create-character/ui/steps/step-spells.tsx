"use client";

import { useMemo, useState } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

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
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import {
  useClassDetail,
  useClassProgression,
  useClassSpells,
  useClassSpellSlots,
  useSubclassSpells,
} from "@/features/class-catalog/api/use-classes";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import { nativeSelectClassName } from "@/shared/ui/native-select";

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
    <FieldGroup className="gap-6">
      <header className="space-y-2 rounded-xl border bg-muted/20 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-heading text-lg font-semibold">
            {className} · nível {level}
          </h2>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {uiProfile.archetypeTitle}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{uiProfile.guide}</p>
        <p className="text-xs text-muted-foreground">
          {uiProfile.listAccessNote}
          {slotRow?.patternName ? ` · ${slotRow.patternName}` : null}
        </p>
      </header>

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

      {hint ? (
        <p className="text-sm text-destructive" role="alert">
          {hint}
        </p>
      ) : null}

      {availableClass.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {LIST_VIEWS.filter((tab) => {
              if (tab.id === "cantrips" && !uiProfile.showCantripPicker) {
                return false;
              }
              return true;
            }).map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  listView === tab.id
                    ? "border-primary bg-primary/10 font-medium"
                    : "hover:bg-muted/50",
                )}
                onClick={() => setListView(tab.id)}
              >
                {tab.label}
                {tab.id === "selected" ? ` (${selectedSlugs.size})` : null}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="spell-search">Buscar</FieldLabel>
              <Input
                id="spell-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nome da magia"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="spell-school">Escola</FieldLabel>
              <select
                id="spell-school"
                className={nativeSelectClassName}
                value={schoolSlug}
                onChange={(e) => setSchoolSlug(e.target.value)}
              >
                <option value="">Todas</option>
                {schools.map(([slug, name]) => (
                  <option key={slug} value={slug}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>
            <CatalogSelect
              id="spell-circle"
              label="Círculo"
              value={circle}
              onChange={(e) => setCircle(e.target.value)}
              options={[
                { value: "", label: "Todos" },
                ...circleOptions.map((lv) => ({
                  value: String(lv),
                  label: lv === 0 ? "Truques (0)" : `Círculo ${lv}`,
                })),
              ]}
            />
          </div>

          {uiProfile.showCantripPicker && visibleCantrips.length > 0 ? (
            <SpellBlock
              title="Truques"
              hint="Sempre disponíveis; não gastam espaços de magia."
            >
              {visibleCantrips.map((spell) => (
                <SimpleSpellRow
                  key={spell.slug}
                  spell={spell}
                  checked={selectedSlugs.has(spell.slug)}
                  onToggle={() => onCantrip(spell)}
                />
              ))}
            </SpellBlock>
          ) : null}

          {visibleLeveled.length > 0 ? (
            <SpellBlock
              title={uiProfile.leveledSectionTitle}
              hint={uiProfile.leveledSectionHint}
            >
              {visibleLeveled.map((spell) =>
                uiProfile.showWizardDualPick ? (
                  <WizardSpellRow
                    key={spell.slug}
                    spell={spell}
                    entry={characterSpells.find(
                      (s) => s.spellSlug === spell.slug,
                    )}
                    onKnown={() => onLeveled(spell, "known")}
                    onPrepared={() => onLeveled(spell, "prepared")}
                  />
                ) : (
                  <SimpleSpellRow
                    key={spell.slug}
                    spell={spell}
                    checked={selectedSlugs.has(spell.slug)}
                    onToggle={() =>
                      onLeveled(
                        spell,
                        mode === "known" ? "known" : "prepared",
                      )
                    }
                  />
                ),
              )}
            </SpellBlock>
          ) : null}

          {visibleSpells.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma magia nesta visualização ou filtro.
            </p>
          ) : null}
        </section>
      ) : null}

      {availableSubclass.length > 0 ? (
        <SpellBlock
          title="Magias de subclasse"
          hint="Sempre preparadas quando concedidas pelo arquétipo."
        >
          {availableSubclass.map((spell) => (
            <li
              key={spell.slug}
              className={cn(
                "list-none rounded-lg border px-3 py-2 text-sm",
                selectedSlugs.has(spell.slug) &&
                  "border-primary bg-primary/5",
              )}
            >
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedSlugs.has(spell.slug)}
                  onChange={() => onSubclass(spell.slug)}
                />
                <span>
                  {spell.name}
                  <span className="ml-1 text-xs text-muted-foreground">
                    nível {spell.unlockLevel}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </SpellBlock>
      ) : null}
    </FieldGroup>
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
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-xl border p-4">
        <p className="text-sm font-medium">Cotas neste nível</p>
        <div className="grid gap-2 sm:grid-cols-2">
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
            <div className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground sm:col-span-2">
              <span className="font-medium text-foreground">
                {profile.extraResourceLabel}:
              </span>{" "}
              {channelMax} uso(s)/descanso longo
              {profile.extraResourceHint ? ` — ${profile.extraResourceHint}` : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 rounded-xl border p-4">
        <p className="text-sm font-medium">Espaços de magia</p>
        {profile.slotPatternNote ? (
          <p className="text-xs text-muted-foreground">
            {profile.slotPatternNote}
          </p>
        ) : null}
        {slotLines.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {slotLines.map(({ level, count }) => (
              <div
                key={level}
                className={cn(
                  "flex min-w-[4.5rem] flex-col items-center rounded-lg border px-2 py-2 text-center",
                  patternSlug === "pact" && "border-primary/40 bg-primary/5",
                )}
              >
                <span className="text-xs text-muted-foreground">
                  {patternSlug === "pact" ? "Pacto" : `Círc. ${level}`}
                </span>
                <span className="text-lg font-semibold tabular-nums">
                  {count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Sem espaços de magia neste nível.
          </p>
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
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">{title}</p>
        {hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">{children}</ul>
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

function SimpleSpellRow({
  spell,
  checked,
  onToggle,
}: {
  spell: ClassSpellOption;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="list-none">
      <label
        className={cn(
          "flex h-full cursor-pointer items-start gap-2 rounded-lg border px-3 py-2.5 text-sm",
          checked && "border-primary bg-primary/5",
        )}
      >
        <input
          type="checkbox"
          className="mt-1"
          checked={checked}
          onChange={onToggle}
        />
        <SpellMeta spell={spell} />
      </label>
    </li>
  );
}

function WizardSpellRow({
  spell,
  entry,
  onKnown,
  onPrepared,
}: {
  spell: ClassSpellOption;
  entry?: { listType: string };
  onKnown: () => void;
  onPrepared: () => void;
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
        )}
      >
        <SpellMeta spell={spell} />
        <div className="flex shrink-0 gap-3 text-xs">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={inBook} onChange={onKnown} />
            Grimório
          </label>
          <label
            className={cn(
              "flex items-center gap-1.5",
              !inBook && "opacity-40",
            )}
          >
            <input
              type="checkbox"
              checked={prepared}
              disabled={!inBook}
              onChange={onPrepared}
            />
            Preparada
          </label>
        </div>
      </div>
    </li>
  );
}

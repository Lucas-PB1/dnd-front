"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

import type { ClassSpellOption } from "@/entities/class/types";
import type { SpellListView } from "@/features/create-character/lib/spells/class-spellcasting-ui";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import {
  SimpleSpellRow,
  SpellBlock,
  WizardSpellRow,
} from "@/features/create-character/ui/steps/spells/spell-pick-rows";
import { WizardFormSection } from "@/features/create-character/ui/wizard/wizard-form-section";
import { Button } from "@/shared/ui/button";
import { CatalogFilters } from "@/shared/ui/catalog-filters";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { cn } from "@/shared/lib/utils";

const LIST_VIEWS: { id: SpellListView; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "cantrips", label: "Truques" },
  { id: "leveled", label: "Magias" },
  { id: "selected", label: "Selecionadas" },
];

type SpellListPickerProps = {
  uiProfile: {
    showCantripPicker: boolean;
    showWizardDualPick: boolean;
    leveledSectionTitle: string;
  };
  mode: "wizard" | "known" | "prepared" | string;
  listView: SpellListView;
  onListViewChange: (view: SpellListView) => void;
  search: string;
  onSearchChange: (value: string) => void;
  schoolSlug: string;
  circle: string;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  schools: [string, string][];
  circleOptions: number[];
  filteredCount: number;
  selectedSlugs: Set<string>;
  characterSpells: CreateCharacterInput["characterSpells"];
  visibleCantrips: ClassSpellOption[];
  visibleLeveled: ClassSpellOption[];
  visibleSpellsCount: number;
  atCantripLimit: boolean;
  atLeveledKnownLimit: boolean;
  atLeveledPreparedLimit: boolean;
  onCantrip: (spell: ClassSpellOption) => void;
  onLeveled: (spell: ClassSpellOption, intent: "known" | "prepared") => void;
  onPreview: (slug: string, kind: "cantrip" | "leveled") => void;
};

export function SpellListPicker({
  uiProfile,
  mode,
  listView,
  onListViewChange,
  search,
  onSearchChange,
  schoolSlug,
  circle,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  schools,
  circleOptions,
  filteredCount,
  selectedSlugs,
  characterSpells,
  visibleCantrips,
  visibleLeveled,
  visibleSpellsCount,
  atCantripLimit,
  atLeveledKnownLimit,
  atLeveledPreparedLimit,
  onCantrip,
  onLeveled,
  onPreview,
}: SpellListPickerProps) {
  return (
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
              onClick={() => onListViewChange(tab.id)}
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
              onClick={onClearFilters}
            >
              <XMarkIcon className="size-3.5" aria-hidden />
              Limpar
            </Button>
          ) : null}
        </div>

        <CatalogSearch
          value={search}
          onChange={onSearchChange}
          placeholder="Buscar por nome…"
          resultCount={filteredCount}
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
          onChange={onFilterChange}
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
              onPreview={() => onPreview(spell.slug, "cantrip")}
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
                entry={characterSpells.find((s) => s.spellSlug === spell.slug)}
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
                onPreview={() => onPreview(spell.slug, "leveled")}
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
                  onLeveled(spell, mode === "known" ? "known" : "prepared")
                }
                onPreview={() => onPreview(spell.slug, "leveled")}
              />
            ),
          )}
        </SpellBlock>
      ) : null}

      {visibleSpellsCount === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma magia nesta visualização.
        </p>
      ) : null}
    </WizardFormSection>
  );
}

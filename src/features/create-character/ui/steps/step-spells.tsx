"use client";

import type { Control, UseFormSetValue } from "react-hook-form";

import { useStepSpells } from "@/features/create-character/lib/use-step-spells";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import { SpellPreviewDialog } from "@/features/create-character/ui/spell-preview-dialog";
import { SpellListPicker } from "@/features/create-character/ui/steps/spell-list-picker";
import { SpellResourcesPanel } from "@/features/create-character/ui/steps/spell-resources-panel";
import { SubclassSpellsSection } from "@/features/create-character/ui/steps/subclass-spells-section";
import { WizardFormSection } from "@/features/create-character/ui/wizard-form-section";

type StepSpellsProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
};

export function StepSpells({ control, setValue }: StepSpellsProps) {
  const spells = useStepSpells(control, setValue);

  if (spells.isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando magias…</p>;
  }

  if (!spells.classSlug) {
    return (
      <p className="text-sm text-muted-foreground">
        Escolha uma classe para ver a lista de magias.
      </p>
    );
  }

  if (
    spells.availableClass.length === 0 &&
    spells.availableSubclass.length === 0
  ) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta combinação de classe e nível não tem escolha de magias.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <WizardFormSection
        title={`${spells.className} · nv. ${spells.level}`}
        compact
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            {spells.uiProfile.archetypeTitle}
          </span>
          {spells.slotRow?.patternName ? (
            <span className="text-xs text-muted-foreground">
              {spells.slotRow.patternName}
            </span>
          ) : null}
        </div>

        <SpellResourcesPanel
          profile={spells.uiProfile}
          counts={spells.counts}
          cantripMax={spells.cantripMax}
          leveledKnownMax={spells.leveledKnownMax}
          leveledPreparedMax={spells.leveledPreparedMax}
          channelMax={spells.progressionRow?.channelDivinity ?? null}
          slotLines={spells.slotLines}
          patternSlug={spells.slotRow?.patternSlug}
        />
      </WizardFormSection>

      {spells.hint ? (
        <p className="text-sm text-destructive" role="alert">
          {spells.hint}
        </p>
      ) : null}

      {spells.availableClass.length > 0 &&
      spells.cantripMax == null &&
      spells.leveledPreparedMax == null &&
      spells.leveledKnownMax == null ? (
        <p className="text-sm text-destructive" role="alert">
          Cotas de magia não carregaram para esta classe. Recarregue a página;
          sem cotas a seleção fica sem limite.
        </p>
      ) : null}

      {spells.availableClass.length > 0 ? (
        <SpellListPicker
          uiProfile={spells.uiProfile}
          mode={spells.mode}
          listView={spells.listView}
          onListViewChange={spells.setListView}
          search={spells.search}
          onSearchChange={spells.setSearch}
          schoolSlug={spells.schoolSlug}
          circle={spells.circle}
          onFilterChange={spells.onFilterChange}
          onClearFilters={spells.clearFilters}
          hasActiveFilters={spells.hasActiveFilters}
          schools={spells.schools}
          circleOptions={spells.circleOptions}
          filteredCount={spells.filtered.length}
          selectedSlugs={spells.selectedSlugs}
          characterSpells={spells.characterSpells}
          visibleCantrips={spells.visibleCantrips}
          visibleLeveled={spells.visibleLeveled}
          visibleSpellsCount={spells.visibleSpells.length}
          atCantripLimit={spells.atCantripLimit}
          atLeveledKnownLimit={spells.atLeveledKnownLimit}
          atLeveledPreparedLimit={spells.atLeveledPreparedLimit}
          onCantrip={spells.onCantrip}
          onLeveled={spells.onLeveled}
          onPreview={(slug, kind) => spells.setPreview({ slug, kind })}
        />
      ) : null}

      <SubclassSpellsSection
        spells={spells.availableSubclass}
        selectedSlugs={spells.selectedSlugs}
        onToggle={spells.onSubclass}
        onPreview={(slug) => spells.setPreview({ slug, kind: "subclass" })}
      />

      <SpellPreviewDialog
        slug={spells.preview?.slug ?? null}
        open={spells.preview != null}
        onOpenChange={(open) => {
          if (!open) spells.setPreview(null);
        }}
        actions={
          spells.preview ? spells.previewActions(spells.preview) : []
        }
      />
    </div>
  );
}

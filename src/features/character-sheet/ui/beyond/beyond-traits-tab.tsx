"use client";

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import type { CharacterDetail } from "@/entities/character/types";
import type { CharacterCatalogLabels } from "@/features/character-sheet/api/use-character-catalog-labels";
import {
  BackgroundTraitsSection,
  ClassFeaturesSection,
  FeatsSection,
  SpeciesChoicesSection,
  SubclassMechanicsSection,
  SubclassOptionsSection,
} from "@/features/character-sheet/ui/sheet-read-sections";
import { cn } from "@/shared/lib/utils";

type TraitsSectionId =
  | "class"
  | "species"
  | "subclass"
  | "feats"
  | "background";

const SECTIONS: { id: TraitsSectionId; label: string }[] = [
  { id: "class", label: "Classe" },
  { id: "species", label: "Espécie" },
  { id: "subclass", label: "Subclasse" },
  { id: "feats", label: "Talentos" },
  { id: "background", label: "Antecedente" },
];

type BeyondTraitsTabProps = {
  character: CharacterDetail;
  labels: CharacterCatalogLabels;
  onEdit?: (section: Exclude<TraitsSectionId, "class">) => void;
};

export function BeyondTraitsTab({
  character,
  labels,
  onEdit,
}: BeyondTraitsTabProps) {
  const baseId = useId();
  const [section, setSection] = useState<TraitsSectionId>("class");
  const tabRefs = useRef<
    Partial<Record<TraitsSectionId, HTMLButtonElement | null>>
  >({});
  const sectionProps = { character, labels };
  const panelId = `${baseId}-panel-${section}`;

  const editLink = (id: Exclude<TraitsSectionId, "class">, label = "Editar") =>
    onEdit ? (
      <button
        type="button"
        onClick={() => onEdit(id)}
        className="text-[0.65rem] font-medium tracking-wide text-primary uppercase hover:underline"
      >
        {label}
      </button>
    ) : null;

  function focusSection(id: TraitsSectionId) {
    setSection(id);
    tabRefs.current[id]?.focus();
  }

  function onTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (
      event.key !== "ArrowRight" &&
      event.key !== "ArrowLeft" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }
    event.preventDefault();
    const last = SECTIONS.length - 1;
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = index === last ? 0 : index + 1;
    if (event.key === "ArrowLeft") nextIndex = index === 0 ? last : index - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = last;
    focusSection(SECTIONS[nextIndex].id);
  }

  const panels: Record<TraitsSectionId, ReactNode> = {
    class: (
      <TraitsBlock
        title={labels.identity.className ?? "Características de classe"}
      >
        <ClassFeaturesSection {...sectionProps} />
      </TraitsBlock>
    ),
    species: (
      <TraitsBlock
        title={labels.identity.speciesName ?? "Espécie"}
        action={editLink("species")}
      >
        <SpeciesChoicesSection {...sectionProps} />
      </TraitsBlock>
    ),
    subclass: (
      <TraitsBlock
        title={labels.identity.subclassName ?? "Subclasse"}
        action={editLink("subclass")}
      >
        <div className="space-y-4">
          <SubclassOptionsSection {...sectionProps} />
          <SubclassMechanicsSection {...sectionProps} />
        </div>
      </TraitsBlock>
    ),
    feats: (
      <TraitsBlock title="Talentos" action={editLink("feats")}>
        <FeatsSection {...sectionProps} />
      </TraitsBlock>
    ),
    background: (
      <TraitsBlock
        title={labels.identity.backgroundName ?? "Antecedente"}
        action={editLink("background", "Ferramenta")}
      >
        <BackgroundTraitsSection
          {...sectionProps}
          onEditTool={onEdit ? () => onEdit("background") : undefined}
        />
      </TraitsBlock>
    ),
  };

  return (
    <div className="space-y-3">
      <div
        className="flex flex-wrap gap-1 rounded-lg border border-border/50 bg-muted/20 p-1"
        role="tablist"
        aria-label="Seções de traços"
      >
        {SECTIONS.map((item, index) => {
          const active = section === item.id;
          const tabId = `${baseId}-tab-${item.id}`;
          return (
            <button
              key={item.id}
              ref={(node) => {
                tabRefs.current[item.id] = node;
              }}
              type="button"
              role="tab"
              id={tabId}
              aria-selected={active}
              aria-controls={panelId}
              tabIndex={active ? 0 : -1}
              onClick={() => setSection(item.id)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${section}`}
      >
        {panels[section]}
      </div>
    </div>
  );
}

function TraitsBlock({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

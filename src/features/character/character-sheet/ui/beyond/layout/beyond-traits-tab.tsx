"use client";

import {
  BookmarkIcon,
  GlobeAltIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import {
  useId,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
  type SVGProps,
} from "react";

import type { CharacterDetail } from "@/entities/character/types";
import type { CharacterCatalogLabels } from "@/features/character/character-sheet/api/use-character-catalog-labels";
import {
  BackgroundTraitsSection,
  CharacterThreadSection,
  ClassFeaturesSection,
  FeatsSection,
  SpeciesChoicesSection,
  SubclassMechanicsSection,
  SubclassOptionsSection,
} from "@/features/character/character-sheet/ui/sections";
import { SheetEditAction } from "@/features/character/character-sheet/ui/sheet/sheet-ui";
import { cn } from "@/shared/lib/utils";

type TraitsSectionId =
  | "class"
  | "species"
  | "subclass"
  | "feats"
  | "background"
  | "thread";

type TraitsEditSectionId = Exclude<TraitsSectionId, "class" | "thread">;

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

type BeyondTraitsTabProps = {
  character: CharacterDetail;
  labels: CharacterCatalogLabels;
  onEdit?: (section: TraitsEditSectionId) => void;
};

type TraitsTabDef = {
  id: TraitsSectionId;
  label: string;
  icon: HeroIcon;
  edit?: TraitsEditSectionId;
  editLabel?: string;
  content: ReactNode;
};

export function BeyondTraitsTab({
  character,
  labels,
  onEdit,
}: BeyondTraitsTabProps) {
  const sectionProps = { character, labels };
  const baseId = useId();
  const tabRefs = useRef<Partial<Record<TraitsSectionId, HTMLButtonElement | null>>>(
    {},
  );

  const tabs: TraitsTabDef[] = [
    {
      id: "class",
      label: labels.identity.className ?? "Classe",
      icon: ShieldCheckIcon,
      content: <ClassFeaturesSection {...sectionProps} />,
    },
    {
      id: "species",
      label: labels.identity.speciesName ?? "Espécie",
      icon: GlobeAltIcon,
      edit: "species",
      content: <SpeciesChoicesSection {...sectionProps} />,
    },
    {
      id: "subclass",
      label: labels.identity.subclassName ?? "Subclasse",
      icon: Squares2X2Icon,
      edit: "subclass",
      content: (
        <div className="space-y-3">
          <SubclassOptionsSection {...sectionProps} />
          <SubclassMechanicsSection {...sectionProps} />
        </div>
      ),
    },
    {
      id: "feats",
      label: "Talentos",
      icon: SparklesIcon,
      edit: "feats",
      content: <FeatsSection {...sectionProps} />,
    },
    {
      id: "background",
      label: labels.identity.backgroundName ?? "Antecedente",
      icon: BookmarkIcon,
      edit: "background",
      editLabel: "Ferramenta",
      content: (
        <BackgroundTraitsSection
          {...sectionProps}
          onEditTool={onEdit ? () => onEdit("background") : undefined}
        />
      ),
    },
    {
      id: "thread",
      label: "Thread",
      icon: PencilSquareIcon,
      content: <CharacterThreadSection {...sectionProps} />,
    },
  ];

  const [active, setActive] = useState<TraitsSectionId>("class");
  const activeTab = tabs.find((tab) => tab.id === active) ?? tabs[0];

  function focusTab(id: TraitsSectionId) {
    setActive(id);
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
    const last = tabs.length - 1;
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = index === last ? 0 : index + 1;
    if (event.key === "ArrowLeft") nextIndex = index === 0 ? last : index - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = last;
    focusTab(tabs[nextIndex].id);
  }

  const panelId = `${baseId}-traits-panel`;

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto border-b border-border/50">
        <div
          className="flex min-w-max gap-0.5"
          role="tablist"
          aria-label="Seções de traços"
        >
          {tabs.map((tab, index) => {
            const isActive = active === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[tab.id] = node;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(tab.id)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                className={cn(
                  "inline-flex max-w-[9.5rem] items-center gap-1 border-b-2 px-2 py-1.5 text-[0.65rem] font-semibold tracking-wide transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border/60 hover:text-foreground",
                )}
              >
                <Icon className="size-3.5 shrink-0 opacity-80" aria-hidden />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${activeTab.id}`}
        className="space-y-2"
      >
        {activeTab.edit && onEdit ? (
          <div className="flex justify-end">
            <SheetEditAction onClick={() => onEdit(activeTab.edit!)}>
              <PencilSquareIcon className="size-3" aria-hidden />
              {activeTab.editLabel ?? "Editar"}
            </SheetEditAction>
          </div>
        ) : null}
        {activeTab.content}
      </div>
    </div>
  );
}

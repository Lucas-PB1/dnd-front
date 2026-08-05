"use client";

import {
  BookmarkIcon,
  GlobeAltIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import type { ComponentType, ReactNode, SVGProps } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import type { CharacterCatalogLabels } from "@/features/character/character-sheet/api/use-character-catalog-labels";
import {
  BackgroundTraitsSection,
  ClassFeaturesSection,
  FeatsSection,
  SpeciesChoicesSection,
  SubclassMechanicsSection,
  SubclassOptionsSection,
} from "@/features/character/character-sheet/ui/sections/sheet-read-sections";
import {
  SheetEditAction,
  SheetSectionHeader,
} from "@/features/character/character-sheet/ui/sheet/sheet-ui";
import { cn } from "@/shared/lib/utils";

type TraitsSectionId =
  | "class"
  | "species"
  | "subclass"
  | "feats"
  | "background";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

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
  const sectionProps = { character, labels };

  const editLink = (id: Exclude<TraitsSectionId, "class">, label = "Editar") =>
    onEdit ? (
      <SheetEditAction onClick={() => onEdit(id)}>
        <PencilSquareIcon className="size-3" aria-hidden />
        {label}
      </SheetEditAction>
    ) : null;

  return (
    <div className="space-y-5">
      <TraitsBlock
        title={labels.identity.className ?? "Características de classe"}
        icon={ShieldCheckIcon}
      >
        <ClassFeaturesSection {...sectionProps} />
      </TraitsBlock>

      <TraitsBlock
        title={labels.identity.speciesName ?? "Espécie"}
        icon={GlobeAltIcon}
        action={editLink("species")}
      >
        <SpeciesChoicesSection {...sectionProps} />
      </TraitsBlock>

      <TraitsBlock
        title={labels.identity.subclassName ?? "Subclasse"}
        icon={Squares2X2Icon}
        action={editLink("subclass")}
      >
        <div className="space-y-4">
          <SubclassOptionsSection {...sectionProps} />
          <SubclassMechanicsSection {...sectionProps} />
        </div>
      </TraitsBlock>

      <TraitsBlock
        title="Talentos"
        icon={SparklesIcon}
        action={editLink("feats")}
      >
        <FeatsSection {...sectionProps} />
      </TraitsBlock>

      <TraitsBlock
        title={labels.identity.backgroundName ?? "Antecedente"}
        icon={BookmarkIcon}
        action={editLink("background", "Ferramenta")}
      >
        <BackgroundTraitsSection
          {...sectionProps}
          onEditTool={onEdit ? () => onEdit("background") : undefined}
        />
      </TraitsBlock>
    </div>
  );
}

function TraitsBlock({
  title,
  icon,
  action,
  children,
  className,
}: {
  title: string;
  icon: HeroIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "space-y-3 border-t border-border/45 pt-4 first:border-t-0 first:pt-0",
        className,
      )}
    >
      <SheetSectionHeader title={title} icon={icon} action={action} />
      {children}
    </section>
  );
}

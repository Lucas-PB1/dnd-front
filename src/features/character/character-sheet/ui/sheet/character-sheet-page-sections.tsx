"use client";

import {
  BoltIcon,
  BookOpenIcon,
  CubeIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, ReactNode, SVGProps } from "react";

import type { CharacterSheetPageSectionId } from "@/features/character/character-sheet/ui/sheet/character-sheet-tab-panels";
import { cn } from "@/shared/lib/utils";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

const PAGE_SECTIONS: {
  id: CharacterSheetPageSectionId;
  label: string;
  icon: HeroIcon;
  tone: string;
}[] = [
  {
    id: "actions",
    label: "Ações",
    icon: BoltIcon,
    tone: "border-secondary/35 bg-secondary/10 text-secondary",
  },
  {
    id: "spells",
    label: "Magias",
    icon: SparklesIcon,
    tone: "border-accent/35 bg-accent/10 text-accent",
  },
  {
    id: "inventory",
    label: "Inventário",
    icon: CubeIcon,
    tone: "border-primary/30 bg-primary/8 text-primary",
  },
  {
    id: "features",
    label: "Traços",
    icon: BookOpenIcon,
    tone: "border-chart-3/35 bg-chart-3/10 text-chart-3",
  },
];

type CharacterSheetPageSectionsProps = {
  panels: Record<CharacterSheetPageSectionId, ReactNode>;
};

export function CharacterSheetPageSections({
  panels,
}: CharacterSheetPageSectionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <nav
        aria-label="Navegação da ficha"
        className="sticky top-2 z-10 grid grid-cols-2 gap-2 rounded-xl border border-border/65 bg-background/88 p-2 shadow-sm backdrop-blur sm:grid-cols-4"
      >
        {PAGE_SECTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={`#sheet-${item.id}`}
              className={cn(
                "group flex min-h-12 items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-semibold tracking-wide uppercase transition-colors hover:bg-card",
                item.tone,
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="min-w-0 truncate">{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="flex flex-col gap-3">
        {PAGE_SECTIONS.map((item) => (
          <section
            key={item.id}
            id={`sheet-${item.id}`}
            className="scroll-mt-20"
          >
            {panels[item.id]}
          </section>
        ))}
      </div>
    </div>
  );
}

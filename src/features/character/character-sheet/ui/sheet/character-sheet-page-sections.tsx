"use client";

import {
  BoltIcon,
  BookOpenIcon,
  CubeIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  useId,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from "react";

import type { CharacterDetail } from "@/entities/character/types";
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

/** Personagem com conjuração / magias na ficha. */
export function characterHasSpellcasting(character: CharacterDetail): boolean {
  return (
    character.characterSpells.length > 0 ||
    character.spellSaveDc != null ||
    character.spellAttackBonus != null ||
    Boolean(character.spellcastingAbilitySlug)
  );
}

type CharacterSheetPageSectionsProps = {
  panels: Record<CharacterSheetPageSectionId, ReactNode>;
  character: CharacterDetail;
};

export function CharacterSheetPageSections({
  panels,
  character,
}: CharacterSheetPageSectionsProps) {
  const baseId = useId();
  const sections = useMemo(
    () =>
      PAGE_SECTIONS.filter(
        (item) =>
          item.id !== "spells" || characterHasSpellcasting(character),
      ),
    [character],
  );
  const [openSection, setOpenSection] = useState<CharacterSheetPageSectionId>(
    "actions",
  );
  const activeId = sections.some((s) => s.id === openSection)
    ? openSection
    : (sections[0]?.id ?? "actions");

  return (
    <div className="flex flex-col gap-2">
      <nav
        aria-label="Navegação da ficha"
        className={cn(
          "sticky top-2 z-10 grid gap-1.5 rounded-xl border border-border/65 bg-background/88 p-1.5 shadow-sm backdrop-blur",
          sections.length >= 4
            ? "grid-cols-2 sm:grid-cols-4"
            : sections.length === 3
              ? "grid-cols-3"
              : "grid-cols-2",
        )}
      >
        {sections.map((item) => {
          const Icon = item.icon;
          const isOpen = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-expanded={isOpen}
              aria-controls={`${baseId}-${item.id}`}
              onClick={() => setOpenSection(item.id)}
              className={cn(
                "group flex min-h-10 items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[0.7rem] font-semibold tracking-wide uppercase transition-colors",
                isOpen
                  ? item.tone
                  : "border-transparent bg-transparent text-muted-foreground hover:bg-card hover:text-foreground",
              )}
            >
              <Icon className="size-3.5 shrink-0" aria-hidden />
              <span className="min-w-0 truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {sections.map((item) => {
        const isOpen = activeId === item.id;
        return (
          <section
            key={item.id}
            id={`${baseId}-${item.id}`}
            hidden={!isOpen}
            className={cn(!isOpen && "hidden")}
          >
            {isOpen ? panels[item.id] : null}
          </section>
        );
      })}
    </div>
  );
}

"use client";

import {
  BookOpenIcon,
  CubeIcon,
  ShieldExclamationIcon,
  SparklesIcon,
  BoltIcon,
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

import { BeyondPanel } from "@/features/character/character-sheet/ui/beyond/layout/beyond-panel";
import { cn } from "@/shared/lib/utils";

export type BeyondTabId =
  | "actions"
  | "resources"
  | "spells"
  | "inventory"
  | "features";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

const TABS: { id: BeyondTabId; label: string; icon: HeroIcon }[] = [
  { id: "actions", label: "Ações", icon: BoltIcon },
  { id: "resources", label: "Classe", icon: ShieldExclamationIcon },
  { id: "spells", label: "Magias", icon: SparklesIcon },
  { id: "inventory", label: "Inventário", icon: CubeIcon },
  { id: "features", label: "Traços", icon: BookOpenIcon },
];

type BeyondMainTabsProps = {
  panels: Record<BeyondTabId, ReactNode>;
  defaultTab?: BeyondTabId;
  className?: string;
};

export function BeyondMainTabs({
  panels,
  defaultTab = "actions",
  className,
}: BeyondMainTabsProps) {
  const baseId = useId();
  const [tab, setTab] = useState<BeyondTabId>(defaultTab);
  const tabRefs = useRef<Partial<Record<BeyondTabId, HTMLButtonElement | null>>>(
    {},
  );

  function focusTab(id: BeyondTabId) {
    setTab(id);
    tabRefs.current[id]?.focus();
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (
      event.key !== "ArrowRight" &&
      event.key !== "ArrowLeft" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }
    event.preventDefault();
    const last = TABS.length - 1;
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = index === last ? 0 : index + 1;
    if (event.key === "ArrowLeft") nextIndex = index === 0 ? last : index - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = last;
    focusTab(TABS[nextIndex].id);
  }

  const panelId = `${baseId}-panel-${tab}`;

  return (
    <BeyondPanel
      flush
      className={cn("flex min-h-[18rem] flex-col", className)}
    >
      <div className="shrink-0 overflow-x-auto border-b border-border/60 bg-muted/25">
        <div
          className="flex min-w-max"
          role="tablist"
          aria-label="Painel da ficha"
        >
          {TABS.map((item, index) => {
            const active = tab === item.id;
            const tabId = `${baseId}-tab-${item.id}`;
            const Icon = item.icon;
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
                onClick={() => setTab(item.id)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold tracking-wide uppercase transition-colors",
                  "border-b-2",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-3.5 opacity-80" aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${tab}`}
        className="flex-1 bg-card/40 p-3.5 sm:p-4"
      >
        {panels[tab]}
      </div>
    </BeyondPanel>
  );
}

"use client";

import {
  BookOpenIcon,
  BoltIcon,
  ShieldExclamationIcon,
  SparklesIcon,
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

import { cn } from "@/shared/lib/utils";

export type SkirmishWorkspaceTabId =
  | "strike"
  | "magic"
  | "sheet"
  | "log";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

const TABS: {
  id: SkirmishWorkspaceTabId;
  label: string;
  icon: HeroIcon;
}[] = [
  { id: "strike", label: "Golpear", icon: BoltIcon },
  { id: "magic", label: "Magia", icon: SparklesIcon },
  { id: "sheet", label: "Ficha", icon: ShieldExclamationIcon },
  { id: "log", label: "Log", icon: BookOpenIcon },
];

type SkirmishWorkspaceTabsProps = {
  panels: Record<SkirmishWorkspaceTabId, ReactNode>;
  defaultTab?: SkirmishWorkspaceTabId;
  hiddenTabs?: readonly SkirmishWorkspaceTabId[];
  className?: string;
};

export function SkirmishWorkspaceTabs({
  panels,
  defaultTab = "strike",
  hiddenTabs = [],
  className,
}: SkirmishWorkspaceTabsProps) {
  const baseId = useId();
  const visible = TABS.filter((tab) => !hiddenTabs.includes(tab.id));
  const initial =
    visible.find((tab) => tab.id === defaultTab)?.id ??
    visible[0]?.id ??
    "strike";
  const [tab, setTab] = useState<SkirmishWorkspaceTabId>(initial);
  const active = visible.some((row) => row.id === tab) ? tab : initial;
  const tabRefs = useRef<
    Partial<Record<SkirmishWorkspaceTabId, HTMLButtonElement | null>>
  >({});

  function focusTab(id: SkirmishWorkspaceTabId) {
    setTab(id);
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
    const last = visible.length - 1;
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = index === last ? 0 : index + 1;
    if (event.key === "ArrowLeft") nextIndex = index === 0 ? last : index - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = last;
    focusTab(visible[nextIndex].id);
  }

  const panelId = `${baseId}-panel-${active}`;

  return (
    <section
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/80 bg-card/55",
        className,
      )}
    >
      <div className="shrink-0 overflow-x-auto border-b border-border/60 bg-muted/25">
        <div
          className="flex min-w-max"
          role="tablist"
          aria-label="Workspace do combate"
        >
          {visible.map((item, index) => {
            const selected = item.id === active;
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
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(item.id)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold tracking-wide uppercase transition-colors",
                  "border-b-2",
                  selected
                    ? "border-secondary text-secondary"
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
        aria-labelledby={`${baseId}-tab-${active}`}
        className="min-h-0 flex-1 overflow-auto bg-card/40 p-3 sm:p-3.5"
      >
        {panels[active]}
      </div>
    </section>
  );
}

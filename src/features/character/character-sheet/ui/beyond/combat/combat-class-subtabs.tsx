"use client";

import { useState, useId, useRef, type ReactNode, type KeyboardEvent } from "react";
import { cn } from "@/shared/lib/utils";

export type SubtabId = "actions" | "powers" | "passives";

type SubtabDef = {
  id: SubtabId;
  label: string;
  icon: string;
  content: ReactNode | null;
};

type CombatClassSubtabsProps = {
  /** Class display name, e.g. "Guerreiro" */
  title: string;
  tabs: SubtabDef[];
  defaultTab?: SubtabId;
};

export function CombatClassSubtabs({
  title,
  tabs,
  defaultTab,
}: CombatClassSubtabsProps) {
  const visibleTabs = tabs.filter((t) => t.content != null);
  const baseId = useId();
  const [active, setActive] = useState<SubtabId>(
    defaultTab ?? visibleTabs[0]?.id ?? "actions",
  );
  const tabRefs = useRef<Partial<Record<SubtabId, HTMLButtonElement | null>>>(
    {},
  );

  if (visibleTabs.length === 0) return null;

  // If only one tab, skip the tab bar and render directly
  if (visibleTabs.length === 1) {
    return (
      <div className="mt-2 rounded-lg border border-border/70 bg-card/70 overflow-hidden">
        <div className="px-3 py-2">
          <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            {title}
          </p>
        </div>
        <div className="px-3 pb-3">{visibleTabs[0].content}</div>
      </div>
    );
  }

  function focusTab(id: SubtabId) {
    setActive(id);
    tabRefs.current[id]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (
      event.key !== "ArrowRight" &&
      event.key !== "ArrowLeft" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }
    event.preventDefault();
    const last = visibleTabs.length - 1;
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = index === last ? 0 : index + 1;
    if (event.key === "ArrowLeft") nextIndex = index === 0 ? last : index - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = last;
    focusTab(visibleTabs[nextIndex].id);
  }

  const panelId = `${baseId}-subtab-panel-${active}`;
  const activeContent = visibleTabs.find((t) => t.id === active)?.content;

  return (
    <div className="mt-2 rounded-lg border border-border/70 bg-card/70 overflow-hidden">
      <div className="px-3 pt-2 pb-0">
        <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          {title}
        </p>
      </div>

      {/* Sub-tab bar */}
      <div className="overflow-x-auto border-b border-border/40 bg-muted/15 px-1">
        <div
          className="flex min-w-max"
          role="tablist"
          aria-label={`Sub-abas de ${title}`}
        >
          {visibleTabs.map((tab, index) => {
            const isActive = active === tab.id;
            const tabId = `${baseId}-subtab-${tab.id}`;
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[tab.id] = node;
                }}
                type="button"
                role="tab"
                id={tabId}
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(tab.id)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1.5 text-[0.65rem] font-semibold tracking-wide transition-all duration-200",
                  "border-b-2 whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60",
                )}
              >
                <span className="text-sm" aria-hidden>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-tab panel */}
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${baseId}-subtab-${active}`}
        className="max-h-[12rem] overflow-y-auto px-3 py-2"
      >
        {activeContent}
      </div>
    </div>
  );
}

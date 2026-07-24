"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { BeyondPanel } from "@/features/character-sheet/ui/beyond/beyond-panel";
import { cn } from "@/shared/lib/utils";

export type BeyondTabId =
  | "actions"
  | "spells"
  | "inventory"
  | "features"
  | "table"
  | "settings";

const TABS: { id: BeyondTabId; label: string }[] = [
  { id: "actions", label: "Ações" },
  { id: "spells", label: "Magias" },
  { id: "inventory", label: "Inventário" },
  { id: "features", label: "Traços" },
  { id: "table", label: "Mesa" },
  { id: "settings", label: "Ajustes" },
];

type BeyondMainTabsProps = {
  panels: Record<BeyondTabId, ReactNode>;
  defaultTab?: BeyondTabId;
};

export function BeyondMainTabs({
  panels,
  defaultTab = "actions",
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
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") {
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
    <BeyondPanel flush className="flex min-h-[22rem] flex-col">
      <div className="overflow-x-auto border-b border-border/60 bg-muted/25">
        <div
          className="flex min-w-max"
          role="tablist"
          aria-label="Painel da ficha"
        >
          {TABS.map((item, index) => {
            const active = tab === item.id;
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
                onClick={() => setTab(item.id)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                className={cn(
                  "px-3.5 py-2.5 text-xs font-semibold tracking-wide uppercase transition-colors",
                  "border-b-2",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
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
        className="flex-1 overflow-y-auto bg-card/40 p-3"
      >
        {panels[tab]}
      </div>
    </BeyondPanel>
  );
}

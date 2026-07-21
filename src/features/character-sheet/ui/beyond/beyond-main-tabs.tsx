"use client";

import { useState, type ReactNode } from "react";

import { BeyondPanel } from "@/features/character-sheet/ui/beyond/beyond-panel";
import { cn } from "@/shared/lib/utils";

export type BeyondTabId =
  | "actions"
  | "spells"
  | "inventory"
  | "features"
  | "table"
  | "notes";

const TABS: { id: BeyondTabId; label: string }[] = [
  { id: "actions", label: "Ações" },
  { id: "spells", label: "Magias" },
  { id: "inventory", label: "Inventário" },
  { id: "features", label: "Traços" },
  { id: "table", label: "Mesa" },
  { id: "notes", label: "Ajustes" },
];

type BeyondMainTabsProps = {
  panels: Record<BeyondTabId, ReactNode>;
  defaultTab?: BeyondTabId;
};

export function BeyondMainTabs({
  panels,
  defaultTab = "actions",
}: BeyondMainTabsProps) {
  const [tab, setTab] = useState<BeyondTabId>(defaultTab);

  return (
    <BeyondPanel flush className="flex min-h-[22rem] flex-col">
      <div className="overflow-x-auto border-b border-border/60 bg-muted/25">
        <div className="flex min-w-max" role="tablist" aria-label="Painel da ficha">
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
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
      <div className="flex-1 overflow-y-auto bg-card/40 p-3" role="tabpanel">
        {panels[tab]}
      </div>
    </BeyondPanel>
  );
}

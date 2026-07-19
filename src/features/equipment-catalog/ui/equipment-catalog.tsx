"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ArmorGrid } from "@/features/equipment-catalog/ui/armor-grid";
import { GearItemsGrid } from "@/features/equipment-catalog/ui/gear-items-grid";
import { WeaponsGrid } from "@/features/equipment-catalog/ui/weapons-grid";
import { cn } from "@/shared/lib/utils";

const TABS = [
  { id: "weapons", label: "Armas" },
  { id: "armor", label: "Armaduras" },
  { id: "items", label: "Itens" },
] as const;

type EquipmentTab = (typeof TABS)[number]["id"];

function parseTab(value: string | null): EquipmentTab {
  if (value === "armor" || value === "items") return value;
  return "weapons";
}

export function EquipmentCatalog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));

  const setTab = useCallback(
    (next: EquipmentTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "weapons") params.delete("tab");
      else params.set("tab", next);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Tipo de equipamento"
        className="flex flex-wrap gap-1 border-b border-border"
      >
        {TABS.map((entry) => {
          const selected = tab === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(entry.id)}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                selected
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {tab === "weapons" ? <WeaponsGrid /> : null}
        {tab === "armor" ? <ArmorGrid /> : null}
        {tab === "items" ? <GearItemsGrid /> : null}
      </div>
    </div>
  );
}

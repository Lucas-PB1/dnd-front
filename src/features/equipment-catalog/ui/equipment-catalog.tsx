"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ArmorGrid } from "@/features/equipment-catalog/ui/armor-grid";
import { GearItemsGrid } from "@/features/equipment-catalog/ui/gear-items-grid";
import { WeaponsGrid } from "@/features/equipment-catalog/ui/weapons-grid";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

const TABS = [
  {
    id: "weapons",
    label: "Armas",
    description: "Categorias, dano, propriedades e custo.",
  },
  {
    id: "armor",
    label: "Armaduras",
    description: "CA, força mínima e furtividade.",
  },
  {
    id: "items",
    label: "Itens",
    description: "Kits, ferramentas, focos e utilitários.",
  },
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
  const active = TABS.find((entry) => entry.id === tab) ?? TABS[0];

  const setTab = useCallback(
    (next: EquipmentTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "weapons") params.delete("tab");
      else params.set("tab", next);
      // Cada aba tem seu próprio universo de busca/paginação/filtros.
      params.delete("q");
      params.delete("page");
      params.delete("category");
      params.delete("itemType");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-2">
        <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
          Catálogo
        </p>
        <div
          role="tablist"
          aria-label="Tipo de equipamento"
          className="flex flex-wrap gap-1 rounded-lg border bg-muted/20 p-1"
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
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  selected
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                )}
              >
                {entry.label}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground">{active.description}</p>
      </div>

      <div
        key={tab}
        role="tabpanel"
        className={cn(motion.enter, "min-h-40")}
      >
        {tab === "weapons" ? <WeaponsGrid /> : null}
        {tab === "armor" ? <ArmorGrid /> : null}
        {tab === "items" ? <GearItemsGrid /> : null}
      </div>
    </div>
  );
}

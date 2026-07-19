import Link from "next/link";

import type { ArmorSummary } from "@/entities/armor/types";
import { cn } from "@/shared/lib/utils";

type ArmorCardProps = {
  armor: ArmorSummary;
  className?: string;
};

export function ArmorCard({ armor, className }: ArmorCardProps) {
  const ac =
    armor.acFormula ?? (armor.acBase != null ? String(armor.acBase) : null);

  return (
    <Link
      href={`/equipment/armor/${armor.slug}`}
      className={cn(
        "group flex flex-col gap-1.5 border-b border-border px-1 py-3 transition-colors hover:bg-muted/30 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <h2 className="font-heading text-base font-semibold tracking-tight group-hover:text-primary sm:text-lg">
          {armor.name}
        </h2>
        <p className="text-xs font-medium tracking-wide text-primary/90 uppercase">
          {armor.categoryName}
        </p>
        {ac ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            CA {ac}
            {armor.stealthDisadvantage ? " · Desvantagem em Furtividade" : ""}
          </p>
        ) : null}
      </div>
      {armor.strengthReq != null ? (
        <p className="shrink-0 text-xs text-muted-foreground sm:text-right">
          For {armor.strengthReq}+
        </p>
      ) : null}
    </Link>
  );
}

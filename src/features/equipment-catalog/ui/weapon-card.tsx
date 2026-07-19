import Link from "next/link";

import type { WeaponSummary } from "@/entities/weapon/types";
import {
  weaponCategoryLabel,
  weaponCostText,
  weaponTeaser,
} from "@/features/equipment-catalog/lib/weapon-labels";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { cn } from "@/shared/lib/utils";

type WeaponCardProps = {
  weapon: WeaponSummary;
  listPath?: string;
  className?: string;
};

export function WeaponCard({ weapon, listPath, className }: WeaponCardProps) {
  const teaser = weaponTeaser(weapon);
  const cost = weaponCostText(weapon);

  return (
    <Link
      href={withCatalogReturn(`/equipment/weapons/${weapon.slug}`, listPath)}
      className={cn(
        "group flex flex-col gap-1.5 border-b border-border px-1 py-3 transition-colors hover:bg-muted/30 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <h2 className="font-heading text-base font-semibold tracking-tight group-hover:text-primary sm:text-lg">
          {weapon.name}
        </h2>
        <p className="text-xs font-medium tracking-wide text-primary/90 uppercase">
          {weaponCategoryLabel(weapon.category)}
        </p>
        {teaser ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {teaser}
          </p>
        ) : null}
      </div>
      <div className="shrink-0 space-y-0.5 text-xs text-muted-foreground sm:max-w-40 sm:text-right">
        {cost ? <p>{cost}</p> : null}
        {weapon.weight ? <p>{weapon.weight}</p> : null}
      </div>
    </Link>
  );
}

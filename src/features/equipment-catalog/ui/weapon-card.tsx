import type { WeaponSummary } from "@/entities/weapon/types";
import {
  weaponCategoryLabel,
  weaponCostText,
  weaponTeaser,
  weaponWeightText,
} from "@/features/equipment-catalog/lib/weapon-labels";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { CatalogListCard } from "@/shared/ui/catalog-list-card";

type WeaponCardProps = {
  weapon: WeaponSummary;
  listPath?: string;
  className?: string;
};

export function WeaponCard({ weapon, listPath, className }: WeaponCardProps) {
  const teaser = weaponTeaser(weapon);
  const cost = weaponCostText(weapon);
  const weight = weaponWeightText(weapon);

  return (
    <CatalogListCard
      href={withCatalogReturn(`/equipment/weapons/${weapon.slug}`, listPath)}
      title={weapon.name}
      eyebrow={weaponCategoryLabel(weapon.category)}
      teaser={teaser}
      aside={
        <div className="shrink-0 space-y-0.5 text-xs text-muted-foreground sm:max-w-40 sm:text-right">
          {cost ? <p>{cost}</p> : null}
          {weight ? <p>{weight}</p> : null}
        </div>
      }
      className={className}
    />
  );
}

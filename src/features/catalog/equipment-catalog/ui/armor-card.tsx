import type { ArmorSummary } from "@/entities/armor/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { CatalogListCard } from "@/shared/ui/catalog-list-card";

type ArmorCardProps = {
  armor: ArmorSummary;
  listPath?: string;
  className?: string;
};

export function ArmorCard({ armor, listPath, className }: ArmorCardProps) {
  const ac =
    armor.acFormula ?? (armor.acBase != null ? String(armor.acBase) : null);

  return (
    <CatalogListCard
      href={withCatalogReturn(`/equipment/armor/${armor.slug}`, listPath)}
      title={armor.name}
      eyebrow={armor.categoryName}
      teaser={
        ac
          ? `CA ${ac}${armor.stealthDisadvantage ? " · Desvantagem em Furtividade" : ""}`
          : null
      }
      aside={
        <div className="shrink-0 space-y-0.5 text-xs text-muted-foreground sm:max-w-40 sm:text-right">
          {armor.costText ? <p>{armor.costText}</p> : null}
          {armor.weight ? <p>{armor.weight}</p> : null}
          {armor.strengthReq != null ? <p>For {armor.strengthReq}+</p> : null}
        </div>
      }
      className={className}
    />
  );
}

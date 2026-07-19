import type { SubclassSummary } from "@/entities/subclass/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { CatalogListCard } from "@/shared/ui/catalog-list-card";

type SubclassCardProps = {
  subclass: SubclassSummary;
  listPath?: string;
  className?: string;
};

export function SubclassCard({
  subclass,
  listPath,
  className,
}: SubclassCardProps) {
  return (
    <CatalogListCard
      href={withCatalogReturn(`/subclasses/${subclass.slug}`, listPath)}
      title={subclass.name}
      eyebrow={subclass.tagline}
      teaser={subclass.summary}
      aside={
        <p className="shrink-0 text-xs text-muted-foreground sm:max-w-56 sm:text-right">
          {subclass.className}
        </p>
      }
      className={className}
    />
  );
}

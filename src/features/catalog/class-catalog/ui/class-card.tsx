import type { ClassSummary } from "@/entities/class/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { CatalogEditionChip } from "@/shared/ui/catalog-edition-chip";
import { CatalogTileCard } from "@/shared/ui/catalog-list-card";

type ClassCardProps = {
  classItem: ClassSummary;
  listPath?: string;
  className?: string;
};

export function ClassCard({ classItem, listPath, className }: ClassCardProps) {
  return (
    <CatalogTileCard
      href={withCatalogReturn(`/classes/${classItem.slug}`, listPath)}
      title={classItem.name}
      titleExtra={
        <span className="inline-flex shrink-0 items-center gap-1.5">
          <CatalogEditionChip editionSlug={classItem.editionSlug} />
          <span className="font-mono text-xs text-muted-foreground">
            {classItem.hitDie}
          </span>
        </span>
      }
      eyebrow={classItem.tagline}
      teaser={classItem.summary}
      meta={
        <>
          {classItem.primaryAbilityLabel ? (
            <span>{classItem.primaryAbilityLabel}</span>
          ) : null}
          {classItem.skillChoiceCount != null ? (
            <span>
              {classItem.skillChoiceCount} perícia
              {classItem.skillChoiceCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </>
      }
      className={className}
    />
  );
}

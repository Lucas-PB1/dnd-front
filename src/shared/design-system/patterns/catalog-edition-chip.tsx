import { editionShortLabel } from "@/entities/edition/catalog-sources";
import { Badge } from "@/shared/design-system/primitives/badge";
import { cn } from "@/shared/lib/utils";

type CatalogEditionChipProps = {
  editionSlug: string | null | undefined;
  className?: string;
};

/** Chip curto PHB / Valdas / DMG / Steinhardt ao lado do nome do item. */
export function CatalogEditionChip({
  editionSlug,
  className,
}: CatalogEditionChipProps) {
  const label = editionShortLabel(editionSlug);
  return (
    <Badge
      variant="edition"
      size="sm"
      className={cn(className)}
      title={editionSlug ?? undefined}
    >
      {label}
    </Badge>
  );
}

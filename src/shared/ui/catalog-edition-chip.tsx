import { editionShortLabel } from "@/entities/edition/catalog-sources";
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
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-sm border border-border/70 bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase",
        className,
      )}
      title={editionSlug ?? undefined}
    >
      {label}
    </span>
  );
}

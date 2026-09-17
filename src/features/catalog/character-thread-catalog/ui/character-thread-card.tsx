import type { CharacterThreadSummary } from "@/entities/character-thread/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { CatalogEditionChip } from "@/shared/ui/catalog-edition-chip";
import { CatalogTileCard } from "@/shared/ui/catalog-list-card";
import { cn } from "@/shared/lib/utils";

type CharacterThreadCardProps = {
  thread: CharacterThreadSummary;
  listPath?: string;
  className?: string;
};

export function CharacterThreadCard({
  thread,
  listPath,
  className,
}: CharacterThreadCardProps) {
  return (
    <CatalogTileCard
      href={withCatalogReturn(`/character-threads/${thread.slug}`, listPath)}
      title={thread.name}
      titleExtra={<CatalogEditionChip editionSlug={thread.editionSlug} />}
      teaser={thread.summary}
      className={cn("h-full", className)}
    />
  );
}

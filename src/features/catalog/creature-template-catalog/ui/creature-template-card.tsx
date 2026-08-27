import type { CreatureTemplateSummary } from "@/entities/creature-template/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { CatalogEditionChip } from "@/shared/ui/catalog-edition-chip";
import { CatalogTileCard } from "@/shared/ui/catalog-list-card";

type CreatureTemplateCardProps = {
  template: CreatureTemplateSummary;
  listPath?: string;
};

export function CreatureTemplateCard({
  template,
  listPath,
}: CreatureTemplateCardProps) {
  return (
    <CatalogTileCard
      href={withCatalogReturn(`/creatures/${template.slug}`, listPath)}
      title={template.name}
      titleExtra={<CatalogEditionChip editionSlug={template.editionSlug} />}
      eyebrow={template.creatureType}
      meta={
        <>
          {template.challengeRating ? (
            <span>ND {template.challengeRating}</span>
          ) : null}
          {template.sizeSlug ? <span>{template.sizeSlug}</span> : null}
          {template.armorClass != null ? (
            <span>CA {template.armorClass}</span>
          ) : null}
          {template.hitPointsAvg != null ? (
            <span>{template.hitPointsAvg} PV</span>
          ) : null}
        </>
      }
    />
  );
}

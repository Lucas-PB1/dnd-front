import type { SkillSummary } from "@/entities/skill/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { CatalogListCard } from "@/shared/ui/catalog-list-card";

type SkillCardProps = {
  skill: SkillSummary;
  listPath?: string;
  className?: string;
};

export function SkillCard({ skill, listPath, className }: SkillCardProps) {
  return (
    <CatalogListCard
      href={withCatalogReturn(`/skills/${skill.slug}`, listPath)}
      title={skill.name}
      eyebrow={skill.abilityName}
      teaser={skill.description}
      className={className}
    />
  );
}

import Link from "next/link";

import type { SkillSummary } from "@/entities/skill/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { cn } from "@/shared/lib/utils";

type SkillCardProps = {
  skill: SkillSummary;
  listPath?: string;
  className?: string;
};

export function SkillCard({ skill, listPath, className }: SkillCardProps) {
  return (
    <Link
      href={withCatalogReturn(`/skills/${skill.slug}`, listPath)}
      className={cn(
        "group flex flex-col gap-1.5 border-b border-border px-1 py-3 transition-colors hover:bg-muted/30 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <h2 className="font-heading text-base font-semibold tracking-tight group-hover:text-primary sm:text-lg">
          {skill.name}
        </h2>
        <p className="text-xs font-medium tracking-wide text-primary/90 uppercase">
          {skill.abilityName}
        </p>
        {skill.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {skill.description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

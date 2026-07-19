import Link from "next/link";

import type { ClassSummary } from "@/entities/class/types";
import { cn } from "@/shared/lib/utils";

type ClassCardProps = {
  classItem: ClassSummary;
  className?: string;
};

export function ClassCard({ classItem, className }: ClassCardProps) {
  return (
    <Link
      href={`/classes/${classItem.slug}`}
      className={cn(
        "group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-ring hover:bg-muted/30",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-0.5">
          <h2 className="font-heading text-lg font-semibold tracking-tight group-hover:text-primary">
            {classItem.name}
          </h2>
          {classItem.tagline ? (
            <p className="text-xs font-medium tracking-wide text-primary/90 uppercase">
              {classItem.tagline}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {classItem.hitDie}
        </span>
      </div>

      {classItem.summary ? (
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {classItem.summary}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        {classItem.primaryAbilityLabel ? (
          <span>{classItem.primaryAbilityLabel}</span>
        ) : null}
        {classItem.skillChoiceCount != null ? (
          <span>
            {classItem.skillChoiceCount} perícia
            {classItem.skillChoiceCount === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

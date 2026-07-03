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
        "group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-ring hover:bg-muted/30",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-semibold tracking-tight group-hover:underline">
          {classItem.name}
        </h2>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {classItem.hitDie}
        </span>
      </div>
      {classItem.primaryAbilityLabel ? (
        <p className="text-sm text-muted-foreground">
          Atributo: {classItem.primaryAbilityLabel}
        </p>
      ) : null}
      {classItem.skillChoiceCount != null ? (
        <p className="text-xs text-muted-foreground">
          {classItem.skillChoiceCount} perícia
          {classItem.skillChoiceCount === 1 ? "" : "s"} à escolha
        </p>
      ) : null}
    </Link>
  );
}

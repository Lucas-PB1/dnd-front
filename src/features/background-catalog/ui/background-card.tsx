import Link from "next/link";

import type { BackgroundSummary } from "@/entities/background/types";
import { cn } from "@/shared/lib/utils";

type BackgroundCardProps = {
  background: BackgroundSummary;
  className?: string;
};

export function BackgroundCard({ background, className }: BackgroundCardProps) {
  return (
    <Link
      href={`/backgrounds/${background.slug}`}
      className={cn(
        "group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-ring hover:bg-muted/30",
        className,
      )}
    >
      <h2 className="font-semibold tracking-tight group-hover:underline">
        {background.name}
      </h2>
      {background.abilityOptionNames?.length ? (
        <p className="text-sm text-muted-foreground">
          Atributos: {background.abilityOptionNames.join(", ")}
        </p>
      ) : null}
    </Link>
  );
}

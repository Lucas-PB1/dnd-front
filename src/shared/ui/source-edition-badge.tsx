"use client";

import { useQuery } from "@tanstack/react-query";

import {
  ACTIVE_EDITION_SLUG,
  editionsKeys,
  fetchEditions,
} from "@/entities/edition/api";
import { cn } from "@/shared/lib/utils";

type SourceEditionBadgeProps = {
  className?: string;
  /** Se true, busca /editions; senão usa label fixo PHB 2024. */
  live?: boolean;
};

export function SourceEditionBadge({
  className,
  live = false,
}: SourceEditionBadgeProps) {
  const { data } = useQuery({
    queryKey: editionsKeys.all,
    queryFn: fetchEditions,
    enabled: live,
    staleTime: 60_000 * 30,
  });

  const edition =
    data?.find((row) => row.slug === ACTIVE_EDITION_SLUG) ?? data?.[0];
  const label = edition?.book ?? "Livro do Jogador 2024";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
      title={edition ? `${edition.label} · ${edition.language}` : undefined}
    >
      Fonte: {label}
    </span>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";

import {
  ACTIVE_EDITION_SLUG,
  editionsKeys,
  fetchEditions,
} from "@/entities/edition/api";
import { cn } from "@/shared/lib/utils";
import { SealMark } from "@/shared/ui/brand-marks";

type SourceEditionBadgeProps = {
  className?: string;
  /** Se true, busca /editions; senão usa label fixo PHB 2024. */
  live?: boolean;
};

/** Carimbo tipográfico — fonte do livro ativo (Grimoire). */
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
        "inline-flex items-center gap-1.5 border border-secondary/50 bg-secondary/10 px-2 py-0.5 font-heading text-[0.7rem] font-semibold tracking-[0.04em] text-secondary uppercase",
        "rounded-sm shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--secondary)_18%,transparent)]",
        className,
      )}
      title={edition ? `${edition.label} · ${edition.language}` : undefined}
    >
      <SealMark className="size-3.5" />
      Fonte · {label}
    </span>
  );
}

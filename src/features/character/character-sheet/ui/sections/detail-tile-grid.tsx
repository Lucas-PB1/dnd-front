"use client";

import { useState, type ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { cn } from "@/shared/lib/utils";

export type DetailTileItem = {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  accent?: boolean;
  body: ReactNode;
};

type DetailTileGridProps = {
  items: DetailTileItem[];
  /** Dica acima do grid. */
  hint?: string;
  className?: string;
  /** Colunas no breakpoint sm+. Default 3. */
  columns?: 2 | 3;
};

/**
 * Grade compacta de tiles; o detalhe abre em modal ao clicar.
 */
export function DetailTileGrid({
  items,
  hint,
  className,
  columns = 3,
}: DetailTileGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = items.find((item) => item.id === activeId) ?? null;

  if (items.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      <ul
        className={cn(
          "grid gap-1.5",
          columns === 3
            ? "grid-cols-2 sm:grid-cols-3"
            : "grid-cols-2",
        )}
      >
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setActiveId(item.id)}
              className={cn(
                "flex h-full min-h-[3.25rem] w-full flex-col items-start justify-center rounded-lg border px-2.5 py-2 text-left transition-colors",
                "bg-background/50 hover:border-primary/40 hover:bg-muted/30",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                item.accent && "border-primary/40 bg-primary/[0.06]",
              )}
            >
              {item.badge ? (
                <span className="mb-0.5 font-mono text-[0.58rem] font-semibold tracking-wide text-muted-foreground uppercase">
                  {item.badge}
                </span>
              ) : null}
              <span className="line-clamp-2 font-heading text-[0.8rem] leading-snug font-semibold tracking-tight">
                {item.title}
              </span>
              {item.subtitle ? (
                <span className="mt-0.5 line-clamp-1 text-[0.65rem] text-muted-foreground">
                  {item.subtitle}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={active != null}
        onOpenChange={(open) => {
          if (!open) setActiveId(null);
        }}
      >
        <DialogContent className="flex max-h-[min(92vh,44rem)] flex-col gap-3 overflow-hidden sm:max-w-2xl">
          {active ? (
            <>
              <DialogHeader className="shrink-0">
                <DialogTitle>{active.title}</DialogTitle>
                {active.subtitle || active.badge ? (
                  <DialogDescription>
                    {[active.badge, active.subtitle].filter(Boolean).join(" · ")}
                  </DialogDescription>
                ) : (
                  <DialogDescription className="sr-only">
                    Detalhe do traço
                  </DialogDescription>
                )}
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                {active.body}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type LevelGroupedTilesProps = {
  groups: { level: number; items: DetailTileItem[] }[];
  hint?: string;
};

/** Agrupa tiles por nível, cada grupo em grade de 3. */
export function LevelGroupedDetailTiles({
  groups,
  hint,
}: LevelGroupedTilesProps) {
  return (
    <div className="space-y-3">
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {groups.map((group) => (
        <section key={group.level} className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted/70 px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold tabular-nums text-muted-foreground">
              Nv. {group.level}
            </span>
            <span className="h-px flex-1 bg-border/50" aria-hidden />
          </div>
          <DetailTileGrid items={group.items} />
        </section>
      ))}
    </div>
  );
}

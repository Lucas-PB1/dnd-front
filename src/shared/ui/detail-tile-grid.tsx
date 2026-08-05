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
  content: ReactNode;
};

type DetailTileGridProps = {
  items: DetailTileItem[];
  hint?: string;
  className?: string;
};

/**
 * Grade 2 colunas de “quadrinhos”; o detalhe abre em modal ao clicar.
 */
export function DetailTileGrid({
  items,
  hint = "Toque em um item para ver os detalhes.",
  className,
}: DetailTileGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = items.find((item) => item.id === activeId) ?? null;

  if (items.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveId(item.id)}
            className={cn(
              "flex min-h-[3.25rem] flex-col items-start justify-center gap-0.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
              "hover:border-primary/40 hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              item.accent
                ? "border-primary/40 bg-primary/5"
                : "border-border/70 bg-background/50",
            )}
          >
            {item.badge ? (
              <span className="rounded bg-muted/70 px-1 py-px font-mono text-[0.6rem] font-semibold tabular-nums text-muted-foreground">
                {item.badge}
              </span>
            ) : null}
            <span className="line-clamp-2 font-heading text-sm font-semibold leading-snug tracking-tight">
              {item.title}
            </span>
            {item.subtitle ? (
              <span className="line-clamp-1 text-[0.65rem] text-muted-foreground">
                {item.subtitle}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <Dialog
        open={active != null}
        onOpenChange={(open) => {
          if (!open) setActiveId(null);
        }}
      >
        <DialogContent className="flex max-h-[min(90vh,40rem)] flex-col gap-3 overflow-hidden sm:max-w-lg">
          <DialogHeader className="shrink-0">
            <DialogTitle>{active?.title}</DialogTitle>
            {active?.subtitle || active?.badge ? (
              <DialogDescription>
                {[active.badge, active.subtitle].filter(Boolean).join(" · ")}
              </DialogDescription>
            ) : null}
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {active?.content}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

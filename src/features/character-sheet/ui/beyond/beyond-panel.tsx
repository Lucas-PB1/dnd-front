"use client";

import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

/** Painel no estilo Beyond — borda acentuada, fundo de card. */
export function BeyondPanel({
  title,
  children,
  className,
  headerRight,
  flush = false,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
  flush?: boolean;
}) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card/60",
        className,
      )}
    >
      {title ? (
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-3 py-2">
          <h2 className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            {title}
          </h2>
          {headerRight}
        </header>
      ) : null}
      <div className={cn("min-h-0 flex-1", !flush && "p-3")}>{children}</div>
    </section>
  );
}

export const ABILITY_SHORT: Record<string, string> = {
  forca: "FOR",
  destreza: "DES",
  constituicao: "CON",
  inteligencia: "INT",
  sabedoria: "SAB",
  carisma: "CAR",
};

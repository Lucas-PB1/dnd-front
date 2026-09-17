"use client";

export function SkirmishDetailSkeleton() {
  return (
    <div
      className="space-y-3"
      role="status"
      aria-busy="true"
      aria-label="Carregando combate"
    >
      <div className="h-4 w-28 animate-pulse rounded bg-muted/40" />
      <div className="flex items-center gap-2">
        <div className="size-7 animate-pulse rounded-full bg-muted/40" />
        <div className="h-7 w-48 animate-pulse rounded bg-muted/40" />
      </div>
      <div className="flex gap-2">
        <div className="h-16 flex-1 animate-pulse rounded-lg bg-muted/35" />
        <div className="h-16 flex-1 animate-pulse rounded-lg bg-muted/35" />
      </div>
      <div className="h-20 animate-pulse rounded-xl bg-muted/30" />
      <div className="h-48 animate-pulse rounded-xl border border-border/70 bg-card/40" />
    </div>
  );
}

import { cn } from "@/shared/lib/utils";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-lg border border-border/50 bg-card/60",
        className,
      )}
    />
  );
}

/** Placeholder alinhado ao layout Beyond (header + atributos + 3 colunas). */
export function CharacterSheetLoadingSkeleton() {
  return (
    <div
      className="flex flex-col gap-2.5 pb-6 sm:gap-3 sm:pb-8"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Carregando ficha"
    >
      <p className="text-sm font-medium text-foreground">Carregando ficha…</p>

      <header className="rounded-xl border border-border/65 bg-card/70 p-3 shadow-sm sm:p-4">
        <SkeletonBlock className="mb-3 h-3 w-28" />
        <div className="flex items-start gap-3">
          <SkeletonBlock className="size-12 shrink-0 rounded-xl sm:size-14" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-7 w-48 max-w-full sm:h-8 sm:w-64" />
            <div className="flex flex-wrap gap-1.5">
              <SkeletonBlock className="h-6 w-14" />
              <SkeletonBlock className="h-6 w-20" />
              <SkeletonBlock className="h-6 w-24" />
            </div>
          </div>
          <div className="hidden gap-2 sm:flex">
            <SkeletonBlock className="h-8 w-20" />
            <SkeletonBlock className="h-8 w-8" />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border/40 pt-3">
          <SkeletonBlock className="h-9 w-16" />
          <SkeletonBlock className="h-9 w-16" />
          <SkeletonBlock className="h-9 w-20" />
          <SkeletonBlock className="h-9 w-24" />
        </div>
      </header>

      <div className="rounded-xl border border-border/60 bg-card/45 p-2 shadow-sm">
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <SkeletonBlock key={index} className="h-14 sm:h-16" />
          ))}
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 items-start gap-2.5",
          "xl:grid-cols-[17rem_minmax(0,1fr)_17rem]",
          "2xl:grid-cols-[18rem_minmax(0,1fr)_18rem]",
        )}
      >
        <aside className="order-3 hidden min-w-0 xl:order-1 xl:block">
          <SkeletonBlock className="h-[28rem] rounded-xl" />
        </aside>

        <div className="order-1 flex min-w-0 flex-col gap-2 xl:order-2">
          <SkeletonBlock className="h-36 rounded-xl" />
          <SkeletonBlock className="h-64 rounded-xl" />
        </div>

        <aside className="order-2 min-w-0 xl:order-3">
          <SkeletonBlock className="h-72 rounded-xl xl:h-[28rem]" />
        </aside>
      </div>
    </div>
  );
}

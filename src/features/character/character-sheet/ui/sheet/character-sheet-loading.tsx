import type { CharacterSummary } from "@/entities/character/types";
import { cn } from "@/shared/lib/utils";
import { InkFlourish, MarginCorner, SealMark } from "@/shared/ui/brand-marks";
import { SheetChip } from "@/features/character/character-sheet/ui/sheet/sheet-ui";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-lg border border-border/45 bg-muted/35",
        className,
      )}
    />
  );
}

type CharacterSheetLoadingSkeletonProps = {
  /** Resumo da lista em cache — header real enquanto o detalhe chega. */
  summary?: Pick<
    CharacterSummary,
    "name" | "level" | "className" | "speciesName" | "subclassName"
  > | null;
};

/** Placeholder alinhado ao chrome Taverna da ficha Beyond. */
export function CharacterSheetLoadingSkeleton({
  summary,
}: CharacterSheetLoadingSkeletonProps) {
  return (
    <div
      className="flex flex-col gap-2.5 pb-6 sm:gap-3 sm:pb-8"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={
        summary?.name
          ? `Carregando ficha de ${summary.name}`
          : "Carregando ficha"
      }
    >
      <header className="relative overflow-hidden rounded-xl border border-border bg-card/50 shadow-sm backdrop-blur-sm">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--muted)_75%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--secondary)_16%,transparent),transparent_50%)]"
          aria-hidden
        />
        <MarginCorner className="pointer-events-none absolute top-2 left-2 size-7 sm:size-8" />
        <MarginCorner
          mirror
          className="pointer-events-none absolute right-2 bottom-2 size-7 sm:size-8"
        />

        <div className="relative flex flex-col gap-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SkeletonBlock className="h-4 w-28" />
            <div className="flex gap-2">
              <SkeletonBlock className="h-7 w-24" />
              <SkeletonBlock className="h-7 w-16" />
            </div>
          </div>

          <div className="flex min-w-0 flex-wrap items-start gap-x-3 gap-y-2">
            <SealMark className="size-10 shrink-0 text-secondary/70 sm:size-11" />
            <div className="min-w-0 space-y-1.5">
              {summary?.name ? (
                <>
                  <h1 className="font-heading max-w-56 truncate text-2xl font-semibold leading-none tracking-tight sm:max-w-[20rem] sm:text-3xl">
                    {summary.name}
                  </h1>
                  <InkFlourish className="h-3 w-32 text-secondary/50 sm:w-40" />
                </>
              ) : (
                <>
                  <SkeletonBlock className="h-8 w-48 max-w-full sm:h-9 sm:w-64" />
                  <SkeletonBlock className="h-3 w-36" />
                </>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 sm:justify-end">
              {summary ? (
                <>
                  <SheetChip active>Nv. {summary.level}</SheetChip>
                  {summary.speciesName ? (
                    <SheetChip>{summary.speciesName}</SheetChip>
                  ) : null}
                  {summary.className ? (
                    <SheetChip>{summary.className}</SheetChip>
                  ) : null}
                  {summary.subclassName ? (
                    <SheetChip>{summary.subclassName}</SheetChip>
                  ) : null}
                </>
              ) : (
                <>
                  <SkeletonBlock className="h-6 w-14" />
                  <SkeletonBlock className="h-6 w-20" />
                  <SkeletonBlock className="h-6 w-24" />
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }, (_, index) => (
              <SkeletonBlock key={index} className="h-17" />
            ))}
          </div>
        </div>
      </header>

      <div className="rounded-xl border border-border/80 bg-card/50 p-2 shadow-sm backdrop-blur-[2px]">
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6 lg:grid-cols-9">
          {Array.from({ length: 9 }, (_, index) => (
            <SkeletonBlock
              key={index}
              className={cn(
                "min-h-15",
                index === 8 && "col-span-3 sm:col-span-6 lg:col-span-2",
              )}
            />
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
          <div className="overflow-hidden rounded-xl border border-border/80 bg-card/55">
            <div className="border-b border-border/60 bg-muted/25 px-3 py-2">
              <SkeletonBlock className="h-3 w-20" />
            </div>
            <div className="space-y-2 p-3">
              <SkeletonBlock className="h-24" />
              <SkeletonBlock className="h-32" />
              <SkeletonBlock className="h-20" />
            </div>
          </div>
        </aside>

        <div className="order-1 flex min-w-0 flex-col gap-2 xl:order-2">
          <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-border/65 bg-background/70 p-1.5 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonBlock key={index} className="h-10" />
            ))}
          </div>
          <div className="overflow-hidden rounded-xl border border-border/80 bg-card/55">
            <div className="border-b border-border/60 bg-muted/25 px-3 py-2">
              <SkeletonBlock className="h-3 w-16" />
            </div>
            <div className="space-y-2 p-3">
              <SkeletonBlock className="h-12" />
              <SkeletonBlock className="h-12" />
              <SkeletonBlock className="h-28" />
            </div>
          </div>
        </div>

        <aside className="order-2 min-w-0 xl:order-3">
          <div className="overflow-hidden rounded-xl border border-border/80 bg-card/55">
            <div className="border-b border-border/60 bg-muted/25 px-3 py-2">
              <SkeletonBlock className="h-3 w-24" />
            </div>
            <div className="space-y-1.5 p-3">
              {Array.from({ length: 8 }, (_, index) => (
                <SkeletonBlock key={index} className="h-8" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

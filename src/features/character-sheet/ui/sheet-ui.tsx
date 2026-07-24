import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

/** Rótulo de banda entre grupos de seções. */
export function SheetBandLabel({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "primary";
}) {
  return (
    <p
      className={cn(
        "pt-1 text-[0.65rem] font-medium tracking-[0.14em] uppercase",
        tone === "primary" ? "text-primary" : "text-muted-foreground",
      )}
    >
      {children}
    </p>
  );
}

/** Campo de metadado (rótulo + valor). */
export function SheetMetaField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium">{children}</dd>
    </div>
  );
}

/** Tile de estatística (CA, PB, atributo…). */
export function SheetStatTile({
  label,
  value,
  hint,
  emphasize = false,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  emphasize?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5 text-center",
        emphasize
          ? "border-primary/40 bg-primary/8"
          : "border-border/80 bg-background/50",
        className,
      )}
    >
      <p className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="font-heading mt-0.5 text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/** Chip compacto para listas (magias, idiomas, perícias). */
export function SheetChip({
  children,
  hint,
  active = false,
  className,
}: {
  children: ReactNode;
  hint?: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 rounded-md border px-2 py-0.5 text-xs",
        active
          ? "border-primary/45 bg-primary/10 font-medium text-foreground"
          : "border-border/80 bg-muted/25 text-foreground",
        className,
      )}
    >
      <span>{children}</span>
      {hint ? (
        <span className="text-[10px] text-muted-foreground">{hint}</span>
      ) : null}
    </span>
  );
}

/** Pip de slot de magia. */
export function SheetSlotPips({ max, used }: { max: number; used: number }) {
  return (
    <div className="flex flex-wrap gap-1" aria-hidden>
      {Array.from({ length: max }, (_, i) => {
        const spent = i < used;
        return (
          <span
            key={i}
            className={cn(
              "size-2.5 rounded-full border",
              spent
                ? "border-muted-foreground/40 bg-muted-foreground/30"
                : "border-primary/50 bg-primary",
            )}
          />
        );
      })}
    </div>
  );
}

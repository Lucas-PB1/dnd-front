import type { ComponentType, ReactNode, SVGProps } from "react";

import { cn } from "@/shared/lib/utils";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

/** Cabeçalho de seção na ficha (ícone + título + linha). */
export function SheetSectionHeader({
  id,
  title,
  count,
  icon: Icon,
  action,
  className,
}: {
  id?: string;
  title: string;
  count?: number;
  icon?: HeroIcon;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Icon ? (
        <Icon className="size-3.5 shrink-0 text-secondary" aria-hidden />
      ) : null}
      <h3 id={id} className="font-heading text-sm font-semibold tracking-tight">
        {title}
        {count != null ? (
          <span className="ml-1.5 font-mono text-[0.7rem] font-normal tabular-nums text-muted-foreground">
            ({count})
          </span>
        ) : null}
      </h3>
      <span className="h-px flex-1 bg-border/50" aria-hidden />
      {action}
    </div>
  );
}

/** Cabeçalho compacto uppercase (subseções). */
export function SheetSubheader({
  id,
  title,
  count,
  icon: Icon,
  className,
}: {
  id?: string;
  title: string;
  count?: number;
  icon?: HeroIcon;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Icon ? (
        <Icon className="size-3.5 shrink-0 text-secondary" aria-hidden />
      ) : null}
      <h4
        id={id}
        className="text-[0.7rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase"
      >
        {title}
        {count != null ? (
          <span className="ml-1.5 font-mono tabular-nums text-muted-foreground/80">
            ({count})
          </span>
        ) : null}
      </h4>
      <span className="h-px flex-1 bg-border/50" aria-hidden />
    </div>
  );
}

/** Empty state tracejado nas abas da ficha. */
export function SheetEmptyHint({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "rounded-md border border-dashed border-border/70 px-3 py-4 text-sm text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Link/botão “Editar” compacto do header de painel. */
export function SheetEditAction({
  onClick,
  children = "Editar",
}: {
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[0.65rem] font-medium tracking-wide text-primary uppercase hover:underline"
    >
      {children}
    </button>
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
          ? "border-secondary/50 bg-secondary/10 font-medium text-foreground"
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

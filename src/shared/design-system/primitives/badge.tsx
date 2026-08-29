import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

export const badgeVariants = cva(
  "inline-flex shrink-0 max-w-full items-center justify-center truncate border font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "border-border/70 bg-background/60 text-foreground/90",
        muted:
          "border-border/60 bg-muted/30 text-muted-foreground",
        secondary:
          "border-secondary/40 bg-secondary/10 text-secondary",
        primary:
          "border-primary/35 bg-primary/8 text-primary",
        accent:
          "border-accent/40 bg-accent/10 text-accent-foreground",
        destructive:
          "border-destructive/40 bg-destructive/10 text-destructive",
        magic:
          "border-chart-4/40 bg-chart-4/15 text-chart-4",
        warn:
          "border-chart-2/40 bg-chart-2/15 text-chart-2",
        coverage:
          "border-chart-2/40 bg-chart-2/15 text-chart-2",
        edition:
          "rounded-sm border-border/70 bg-muted/40 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase",
        outline: "border-border bg-transparent text-foreground",
      },
      size: {
        default: "rounded-md px-2 py-0.5 text-xs",
        sm: "rounded border px-1.5 py-px text-[10px] leading-tight",
        xs: "rounded border px-1.5 py-px text-[0.65rem] font-mono tabular-nums",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type BadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>;

export type BadgeTone = "magic" | "coverage" | "warn" | "muted" | "default";

export function badgeVariantFromTone(
  tone: BadgeTone | undefined,
): BadgeVariant {
  switch (tone) {
    case "magic":
      return "magic";
    case "coverage":
      return "coverage";
    case "warn":
      return "warn";
    case "muted":
      return "muted";
    default:
      return "default";
  }
}

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge };

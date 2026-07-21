"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useId, useState, type ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type CollapsibleCardProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  /** Densidade menor para ficha / listas longas. */
  size?: "default" | "compact";
};

export function CollapsibleCard({
  title,
  subtitle,
  defaultOpen = false,
  children,
  className,
  size = "default",
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const compact = size === "compact";

  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground",
        className,
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-start justify-between gap-3 text-left transition-colors hover:bg-muted/40",
          compact ? "px-3 py-2" : "px-4 py-3 sm:px-5 sm:py-4",
        )}
      >
        <span className={cn("min-w-0 flex-1", compact ? "space-y-0.5" : "space-y-1")}>
          <span
            className={cn(
              "block font-heading font-semibold tracking-tight",
              compact ? "text-sm" : "text-base sm:text-lg",
            )}
          >
            {title}
          </span>
          {subtitle ? (
            <span
              className={cn(
                "block text-muted-foreground",
                compact ? "text-xs" : "text-sm",
              )}
            >
              {subtitle}
            </span>
          ) : null}
        </span>
        <ChevronDownIcon
          className={cn(
            "shrink-0 text-muted-foreground transition-transform duration-200",
            compact ? "mt-0.5 size-4" : "mt-1 size-5",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          id={panelId}
          className={cn(
            "animate-in fade-in-0 slide-in-from-top-1 border-t border-border/70 duration-200",
            compact ? "px-3 pt-2.5 pb-3" : "px-4 pt-3 pb-4 sm:px-5 sm:pb-5",
          )}
        >
          {children}
        </div>
      ) : null}
    </article>
  );
}

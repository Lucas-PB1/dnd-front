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
};

export function CollapsibleCard({
  title,
  subtitle,
  defaultOpen = false,
  children,
  className,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

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
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 sm:px-5 sm:py-4"
      >
        <span className="min-w-0 flex-1 space-y-1">
          <span className="block font-heading text-base font-semibold tracking-tight sm:text-lg">
            {title}
          </span>
          {subtitle ? (
            <span className="block text-sm text-muted-foreground">
              {subtitle}
            </span>
          ) : null}
        </span>
        <ChevronDownIcon
          className={cn(
            "mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          id={panelId}
          className="border-t border-border/70 px-4 pt-3 pb-4 sm:px-5 sm:pb-5"
        >
          {children}
        </div>
      ) : null}
    </article>
  );
}

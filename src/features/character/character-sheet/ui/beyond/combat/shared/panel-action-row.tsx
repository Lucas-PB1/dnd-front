"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useId, useState, type ReactNode } from "react";

import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type ButtonVariant = "outline" | "ghost" | "secondary" | "default";
type ButtonSize = "xs" | "sm";

export type CombatPanelActionRowProps = {
  name: string;
  /** Texto jogável sob o nome (visível quando a lista está aberta). */
  description?: string | null;
  actionLabel?: string;
  disabled?: boolean;
  pending?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onAction: () => void;
  className?: string;
};

/**
 * Linha de ferramenta: nome + descrição + Usar.
 * O colapso fica na lista (`CombatPanelActionList`), não em cada item.
 */
export function CombatPanelActionRow({
  name,
  description,
  actionLabel = "Usar",
  disabled = false,
  pending = false,
  variant = "outline",
  size = "xs",
  onAction,
  className,
}: CombatPanelActionRowProps) {
  const body = description?.trim() ?? "";

  return (
    <li className={cn("flex items-start gap-2 px-2.5 py-2", className)}>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm font-medium text-foreground">{name}</p>
        {body ? (
          <p className="text-xs leading-snug text-muted-foreground">{body}</p>
        ) : null}
      </div>
      <Button
        type="button"
        size={size}
        variant={variant}
        className="shrink-0"
        disabled={disabled || pending}
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </li>
  );
}

export type CombatPanelActionListProps = {
  /** Rótulo do cabeçalho colapsável (ex.: "Manobras", "Ações"). */
  title: string;
  /** Contagem opcional no cabeçalho — `Manobras (7)`. */
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
};

/** Lista colapsável: um toggle para o bloco inteiro; itens com descrição visível. */
export function CombatPanelActionList({
  title,
  count,
  defaultOpen = false,
  children,
  className,
}: CombatPanelActionListProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [openGeneration, setOpenGeneration] = useState(0);
  const panelId = useId();
  const label =
    count != null && count > 0 ? `${title} (${count})` : title;

  function toggleOpen() {
    setOpen((value) => {
      const next = !value;
      if (next) setOpenGeneration((generation) => generation + 1);
      return next;
    });
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border/40 bg-card/30",
        className,
      )}
    >
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-1.5 px-2.5 py-2 text-left",
          "transition-colors hover:bg-muted/30",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        )}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggleOpen}
      >
        <ChevronRightIcon
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open && "rotate-90",
          )}
          aria-hidden
        />
        <span className="text-[0.7rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {label}
        </span>
      </button>
      <div
        className={cn(
          "motion-collapse",
          open ? "motion-collapse-open" : "motion-collapse-closed",
        )}
      >
        <div className="motion-collapse-inner">
          <ul
            key={openGeneration}
            id={panelId}
            className={cn(
              "motion-collapse-panel divide-y divide-border/40 border-t border-border/40",
              open && "motion-stagger",
            )}
            inert={!open ? true : undefined}
          >
            {children}
          </ul>
        </div>
      </div>
    </div>
  );
}

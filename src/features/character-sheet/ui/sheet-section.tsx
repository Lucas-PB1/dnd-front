"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useId, useState, type ReactNode } from "react";

import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type SheetSectionProps = {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  editContent?: ReactNode;
  isEditing?: boolean;
  onEdit?: () => void;
  onCancel?: () => void;
  className?: string;
  /** Mesa de jogo — peso visual distinto da leitura */
  variant?: "sheet" | "table";
  /** Seções densas do PHB começam fechadas */
  collapsible?: boolean;
  defaultOpen?: boolean;
};

export function SheetSection({
  id,
  title,
  description,
  children,
  editContent,
  isEditing = false,
  onEdit,
  onCancel,
  className,
  variant = "sheet",
  collapsible = false,
  defaultOpen = true,
}: SheetSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const canEdit = !!editContent && !!onEdit;
  const isTable = variant === "table";
  const showBody = !collapsible || open || isEditing;

  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 space-y-4 rounded-lg border p-4 transition-colors sm:p-5",
        isTable
          ? "border-primary/35 bg-primary/5 shadow-sm dark:bg-primary/10"
          : "border-border bg-card/40",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          {collapsible && !isEditing ? (
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((value) => !value)}
              className="flex w-full items-start justify-between gap-3 text-left"
            >
              <span className="space-y-1">
                <span className="font-heading block text-xl font-semibold tracking-tight">
                  {title}
                </span>
                {description ? (
                  <span className="block text-sm text-muted-foreground">
                    {description}
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
          ) : (
            <>
              <h2 className="font-heading text-xl font-semibold tracking-tight">
                {title}
              </h2>
              {description ? (
                <p className="text-sm text-muted-foreground">{description}</p>
              ) : null}
            </>
          )}
        </div>
        {canEdit ? (
          <div className="flex shrink-0 gap-2">
            {isEditing && onCancel ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
              >
                Cancelar
              </Button>
            ) : null}
            {!isEditing ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (collapsible) setOpen(true);
                  onEdit?.();
                }}
              >
                Editar
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {showBody ? (
        <div
          id={panelId}
          className={cn(
            collapsible &&
              "animate-in fade-in-0 slide-in-from-top-1 duration-200",
          )}
        >
          {isEditing && editContent ? editContent : children}
        </div>
      ) : null}
    </section>
  );
}

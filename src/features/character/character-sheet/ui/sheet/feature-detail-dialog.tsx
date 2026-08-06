"use client";

import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useState, type ReactNode } from "react";

import { PhbProse } from "@/shared/ui/phb-prose";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { cn } from "@/shared/lib/utils";

type FeatureDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

/** Modal de leitura de traço/ação — mesmo padrão dos tiles da aba Traços. */
export function FeatureDetailDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
}: FeatureDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,40rem)] flex-col gap-3 overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {subtitle ? (
            <DialogDescription>{subtitle}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">
              Detalhe do traço
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

type FeatureDetailTriggerProps = {
  title: string;
  subtitle?: string;
  /** Texto do corpo; preferir descrição completa. */
  description: string;
  /** `icon` = botão info; `text` = o próprio nome é o gatilho. */
  variant?: "icon" | "text";
  className?: string;
  children?: ReactNode;
};

/**
 * Abre o detalhe sem executar a ação de mesa.
 * Use `text` em listas; `icon` ao lado de botões de gastar/usar.
 */
export function FeatureDetailTrigger({
  title,
  subtitle,
  description,
  variant = "icon",
  className,
  children,
}: FeatureDetailTriggerProps) {
  const [open, setOpen] = useState(false);
  const body = description.trim();
  if (!body) return null;

  return (
    <>
      {variant === "text" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "min-w-0 text-left transition-colors",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            className,
          )}
          title="Ver detalhe"
        >
          {children ?? (
            <span className="text-sm font-medium text-foreground underline-offset-2 hover:underline">
              {title}
            </span>
          )}
        </button>
      ) : (
        <Button
          type="button"
          size="xs"
          variant="ghost"
          className={cn("size-7 shrink-0 p-0 text-muted-foreground", className)}
          aria-label={`Ver detalhe de ${title}`}
          title={`Ver detalhe: ${title}`}
          onClick={() => setOpen(true)}
        >
          <InformationCircleIcon className="size-4" aria-hidden />
        </Button>
      )}

      <FeatureDetailDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        subtitle={subtitle}
      >
        <PhbProse text={body} />
      </FeatureDetailDialog>
    </>
  );
}

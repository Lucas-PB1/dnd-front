"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { cn } from "@/shared/lib/utils";

const WIDTH_CLASS = {
  sm: "sm:max-w-md",
  md: "sm:max-w-2xl",
  lg: "sm:max-w-4xl",
} as const;

export type SheetEditDialogWidth = keyof typeof WIDTH_CLASS;

/** Uma seção editável da ficha, sempre aberta em modal. */
export type SheetEditDialogConfig = {
  title: string;
  description: string;
  width: SheetEditDialogWidth;
  content: ReactNode;
};

type SheetEditDialogProps = {
  onClose: () => void;
  title: string;
  description: string;
  width?: SheetEditDialogWidth;
  children: ReactNode;
};

/**
 * Casca de edição da ficha: cabeçalho fixo e corpo preenchido pelo formulário,
 * que cresce até o teto do dialog e só então rola.
 */
export function SheetEditDialog({
  onClose,
  title,
  description,
  width = "md",
  children,
}: SheetEditDialogProps) {
  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        className={cn(
          "flex max-h-[min(92vh,52rem)] min-h-0 flex-col gap-3 overflow-hidden",
          WIDTH_CLASS[width],
        )}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

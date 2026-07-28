"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

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
 * que controla o scroll e o rodapé de ações. Fica aberta enquanto montada.
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
      <DialogContent className={WIDTH_CLASS[width]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import type { ReactNode } from "react";

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
}: SheetSectionProps) {
  const canEdit = !!editContent && !!onEdit;

  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 space-y-4 rounded-lg border border-border p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
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
                onClick={onEdit}
              >
                Editar
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {isEditing && editContent ? editContent : children}
    </section>
  );
}

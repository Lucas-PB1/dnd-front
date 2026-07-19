"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

type CatalogPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function CatalogPagination({
  page,
  totalPages,
  total,
  from,
  to,
  onPageChange,
  className,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Paginação"
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Mostrando {from}–{to} de {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeftIcon className="size-4" aria-hidden />
          Anterior
        </Button>
        <span className="min-w-24 text-center text-sm text-muted-foreground">
          Página {page} de {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Próxima página"
        >
          Próxima
          <ChevronRightIcon className="size-4" aria-hidden />
        </Button>
      </div>
    </nav>
  );
}

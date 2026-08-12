"use client";

import { BookOpenIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { editionMenuLabel } from "@/entities/edition/catalog-sources";
import { useCatalogSources } from "@/features/catalog/catalog-sources/model/catalog-sources-provider";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

/** Seletor global de fontes do catálogo (PHB / Valdas / DMG / Eldritch Hunt). */
export function CatalogSourcesMenu({ className }: { className?: string }) {
  const { editions, editionsPending, enabledSlugs, setEnabled } =
    useCatalogSources();
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5 px-2"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Fontes do catálogo"
        onClick={() => setOpen((value) => !value)}
      >
        <BookOpenIcon className="size-4 opacity-80" aria-hidden />
        <span className="hidden sm:inline">Fontes</span>
      </Button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Fechar fontes"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Fontes do catálogo"
            className="absolute top-full right-0 z-50 mt-1 w-56 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md"
          >
            <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Conteúdo ativo
            </p>
            {editionsPending && editions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : (
              <ul className="space-y-2">
                {editions.map((edition) => {
                  const checked = enabledSlugs.has(edition.slug);
                  return (
                    <li key={edition.slug}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-input"
                          checked={checked}
                          onChange={(event) =>
                            setEnabled(edition.slug, event.target.checked)
                          }
                        />
                        <span>{editionMenuLabel(edition)}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-2 text-[11px] text-muted-foreground">
              Por padrão, todas as fontes ficam marcadas.
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}

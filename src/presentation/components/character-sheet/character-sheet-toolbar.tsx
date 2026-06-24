"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { getCharacterSheetCompletion } from "@/application/character-sheet/sheet-completion";
import type { CharacterSheet } from "@/application/character-sheet/character-sheet.schema";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SheetPage = 1 | 2;

type CharacterSheetToolbarProps = {
  page: SheetPage;
  onPageChange: (page: SheetPage) => void;
  characterName: string;
  sheet: CharacterSheet;
  lastSavedAt: Date | null;
  onClear: () => void;
  sectionLinks?: Array<{ id: string; label: string }>;
};

export function CharacterSheetToolbar({
  page,
  onPageChange,
  characterName,
  sheet,
  lastSavedAt,
  onClear,
  sectionLinks,
}: CharacterSheetToolbarProps) {
  const reduceMotion = useReducedMotion();
  const completion = getCharacterSheetCompletion(sheet);
  const displayName = characterName.trim() || "Personagem sem nome";

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <div className="sticky top-14 z-10 -mx-4 mb-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              {completion}% preenchido
              {lastSavedAt
                ? ` · rascunho salvo às ${lastSavedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                : " · rascunho local automático"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => onPageChange(1)}
              aria-label="Página anterior"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>

            <div className="relative flex rounded-lg border border-border bg-muted/40 p-0.5">
              {([1, 2] as const).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => onPageChange(pageNumber)}
                  className={cn(
                    "relative z-10 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                    page === pageNumber
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {page === pageNumber ? (
                    <motion.span
                      layoutId="sheet-page-tab"
                      className="absolute inset-0 rounded-md bg-primary"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 400, damping: 30 }
                      }
                    />
                  ) : null}
                  <span className="relative z-10">Pág. {pageNumber}</span>
                </button>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page === 2}
              onClick={() => onPageChange(2)}
              aria-label="Próxima página"
            >
              <ChevronRightIcon className="size-4" />
            </Button>

            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
              Limpar
            </Button>
          </div>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${completion}%` }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.35 }}
          />
        </div>

        <AnimatePresence>
          {page === 1 && sectionLinks && sectionLinks.length > 0 ? (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
              className="flex gap-2 overflow-x-auto pb-1"
            >
              {sectionLinks.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {section.label}
                </button>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

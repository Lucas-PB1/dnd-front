"use client";

import {
  EllipsisHorizontalIcon,
  StopCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

import type { SkirmishStatus } from "@/features/skirmish/skirmishes/api/skirmishes.api";
import { SkirmishStatusChip } from "@/features/skirmish/skirmishes/ui/skirmish-status-chip";
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/ui/back-link";
import { InkFlourish, SealMark } from "@/shared/ui/brand-marks";
import { Button } from "@/shared/ui/button";

type SkirmishCombatHeaderProps = {
  title: string;
  status: SkirmishStatus;
  round: number;
  finishPending: boolean;
  removePending: boolean;
  onFinish: () => void;
  onRemove: () => void;
};

export function SkirmishCombatHeader({
  title,
  status,
  round,
  finishPending,
  removePending,
  onFinish,
  onRemove,
}: SkirmishCombatHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const busy = finishPending || removePending;

  return (
    <header className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <BackLink href="/skirmishes">Skirmishes</BackLink>
          <div className="flex items-center gap-2">
            <SealMark className="size-7 shrink-0" />
            <div className="min-w-0">
              <h1 className="font-heading text-lg font-semibold tracking-tight sm:text-xl">
                {title}
              </h1>
              <InkFlourish className="mt-0.5 h-2.5 w-28 text-secondary/50 sm:w-36" />
            </div>
          </div>
        </div>
        <div className="relative flex flex-wrap items-center gap-2">
          <SkirmishStatusChip status={status} />
          <span className="text-sm tabular-nums text-muted-foreground">
            R·{round}
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="size-8 p-0"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Ações do combate"
            disabled={busy}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <EllipsisHorizontalIcon className="size-5" aria-hidden />
          </Button>
          {menuOpen ? (
            <div
              role="menu"
              className={cn(
                "absolute top-full right-0 z-30 mt-1 min-w-40 rounded-lg border border-border/80 bg-background p-1 shadow-md",
              )}
            >
              {status === "active" ? (
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted/40"
                  disabled={busy}
                  onClick={() => {
                    setMenuOpen(false);
                    if (window.confirm("Encerrar este combate agora?")) {
                      onFinish();
                    }
                  }}
                >
                  <StopCircleIcon className="size-4 opacity-80" aria-hidden />
                  {finishPending ? "Encerrando…" : "Encerrar"}
                </button>
              ) : null}
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-destructive hover:bg-muted/40"
                disabled={busy}
                onClick={() => {
                  setMenuOpen(false);
                  if (window.confirm("Excluir este combate?")) {
                    onRemove();
                  }
                }}
              >
                <TrashIcon className="size-4 opacity-80" aria-hidden />
                {removePending ? "Excluindo…" : "Excluir"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

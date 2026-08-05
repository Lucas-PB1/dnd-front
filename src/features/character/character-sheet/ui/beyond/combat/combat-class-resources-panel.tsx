"use client";

import type {
  ClassResourceState,
  ResourceDieRoll,
} from "@/entities/character/session-types";
import { Button } from "@/shared/ui/button";

type CombatClassResourcesPanelProps = {
  resources: ClassResourceState[];
  /** Slugs já tratados pelo painel da classe — omitidos aqui. */
  hideSlugs?: readonly string[];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  onSpend: (resourceSlug: string) => void;
  lastRoll?: ResourceDieRoll | null;
  onRecoverRisk?: () => void;
  canRecoverRisk?: boolean;
};

export function CombatClassResourcesPanel({
  resources,
  hideSlugs = [],
  isPending,
  isError,
  error,
  onSpend,
  lastRoll,
  onRecoverRisk,
  canRecoverRisk = false,
}: CombatClassResourcesPanelProps) {
  const visible = resources.filter(
    (resource) => !hideSlugs.includes(resource.slug),
  );

  if (visible.length === 0) {
    return null;
  }

  return (
    <div className="mt-1.5 rounded-lg border border-border/60 bg-card/60 px-2.5 py-2">
      <p className="text-[0.55rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        Recursos de Classe & Reservas
      </p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {visible.map((resource) => {
          const showPips = resource.max > 0 && resource.max <= 12;
          return (
            <div
              key={resource.slug}
              className="inline-flex flex-col gap-1.5 rounded-lg border border-border/70 bg-background/70 px-3 py-2 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-foreground">
                  {resource.name}
                  {resource.dieLabel ? (
                    <span className="ml-1 font-mono text-accent">
                      ({resource.dieLabel})
                    </span>
                  ) : null}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    className="h-6 px-2 text-[0.7rem] transition-colors hover:bg-primary hover:text-primary-foreground"
                    disabled={resource.remaining <= 0 || isPending}
                    onClick={() => onSpend(resource.slug)}
                  >
                    Gastar
                  </Button>
                  {resource.slug === "risk" &&
                  canRecoverRisk &&
                  onRecoverRisk ? (
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      className="h-6 px-1.5 text-[0.7rem]"
                      disabled={isPending}
                      onClick={onRecoverRisk}
                      title="Gambito Terrível"
                    >
                      +1
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {showPips ? (
                  <div className="flex items-center gap-1" aria-hidden>
                    {Array.from({ length: resource.max }).map((_, index) => {
                      const isAvailable = index < resource.remaining;
                      return (
                        <span
                          key={index}
                          className={
                            isAvailable
                              ? "size-2.5 rounded-full bg-secondary"
                              : "size-2.5 rounded-full border border-border/80 bg-muted/30"
                          }
                        />
                      );
                    })}
                  </div>
                ) : null}
                <span className="text-[0.7rem] font-medium tabular-nums text-muted-foreground">
                  {resource.remaining} / {resource.max}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {lastRoll ? (
        <p className="mt-2 text-sm font-medium text-secondary" role="status">
          {lastRoll.expression} → <strong>{lastRoll.value}</strong>
        </p>
      ) : null}
      {isError ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error instanceof Error
            ? error.message
            : "Não foi possível gastar o recurso"}
        </p>
      ) : null}
    </div>
  );
}

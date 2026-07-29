"use client";

import type {
  ClassResourceState,
  ResourceDieRoll,
} from "@/entities/character/session-types";
import { Button } from "@/shared/ui/button";

type CombatClassResourcesPanelProps = {
  resources: ClassResourceState[];
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
  isPending,
  isError,
  error,
  onSpend,
  lastRoll,
  onRecoverRisk,
  canRecoverRisk = false,
}: CombatClassResourcesPanelProps) {
  if (resources.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 rounded-lg border border-border/70 bg-card/70 px-3 py-2">
      <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        Recursos de classe
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {resources.map((resource) => (
          <div
            key={resource.slug}
            className="inline-flex items-center gap-2 rounded-md border border-border/80 bg-background/60 px-2 py-1"
          >
            <span className="text-sm">
              {resource.name}{" "}
              <span className="tabular-nums text-muted-foreground">
                {resource.remaining}/{resource.max}
                {resource.dieLabel ? ` · ${resource.dieLabel}` : ""}
              </span>
            </span>
            <Button
              type="button"
              size="xs"
              variant="outline"
              disabled={resource.remaining <= 0 || isPending}
              onClick={() => onSpend(resource.slug)}
            >
              Usar
            </Button>
            {resource.slug === "risk" && canRecoverRisk && onRecoverRisk ? (
              <Button
                type="button"
                size="xs"
                variant="ghost"
                disabled={isPending}
                onClick={onRecoverRisk}
                title="Gambito Terrível"
              >
                +1
              </Button>
            ) : null}
          </div>
        ))}
      </div>
      {lastRoll ? (
        <p className="mt-2 text-sm text-secondary" role="status">
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

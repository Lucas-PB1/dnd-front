"use client";

import type { ClassResourceState } from "@/entities/character/session-types";

type CombatResourceSummaryProps = {
  resources: ClassResourceState[];
  slugs?: readonly string[];
};

/** Lista compacta remaining/max dos recursos relevantes do painel. */
export function CombatResourceSummary({
  resources,
  slugs,
}: CombatResourceSummaryProps) {
  const visible = slugs
    ? slugs
        .map((slug) => resources.find((item) => item.slug === slug))
        .filter((item): item is ClassResourceState => item != null)
    : resources;

  if (visible.length === 0) return null;

  return (
    <div className="space-y-1 text-sm text-muted-foreground">
      {visible.map((resource) => (
        <p key={resource.slug}>
          {resource.name}:{" "}
          <span className="font-semibold text-foreground">
            {resource.remaining}/{resource.max}
          </span>
          {resource.dieLabel ? (
            <span className="ml-1 font-mono text-xs text-accent">
              ({resource.dieLabel})
            </span>
          ) : null}
        </p>
      ))}
    </div>
  );
}

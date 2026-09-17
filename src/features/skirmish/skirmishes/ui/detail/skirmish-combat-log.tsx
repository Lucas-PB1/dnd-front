"use client";

import type { RefObject } from "react";

import type { SkirmishLogEntry } from "@/features/skirmish/skirmishes/api/skirmishes.schema";

type SkirmishCombatLogProps = {
  entries: readonly SkirmishLogEntry[];
  baseline: number;
  endRef: RefObject<HTMLLIElement | null>;
};

export function SkirmishCombatLog({
  entries,
  baseline,
  endRef,
}: SkirmishCombatLogProps) {
  return (
    <ul
      className="max-h-full min-h-40 space-y-1 overflow-auto text-sm"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Crônica do combate"
    >
      {entries.length === 0 ? (
        <li className="text-muted-foreground">Nenhum evento ainda.</li>
      ) : (
        entries.map((entry, index) => (
          <li
            key={`${entry.at}-${entry.text}-${index}`}
            ref={index === entries.length - 1 ? endRef : undefined}
            className={index >= baseline ? "skirmish-log-line" : undefined}
          >
            <span className="text-muted-foreground">
              {new Date(entry.at).toLocaleTimeString("pt-BR")}
            </span>{" "}
            {entry.text}
          </li>
        ))
      )}
    </ul>
  );
}

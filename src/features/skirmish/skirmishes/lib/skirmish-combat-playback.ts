import type { SkirmishLogEntry } from "@/features/skirmish/skirmishes/api/skirmishes.schema";

export const SKIRMISH_LOG_REVEAL_MS = 1600;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function incomingHitFromLogLine(
  text: string,
  actorName: string,
  pcName: string,
): boolean {
  return (
    text.includes(actorName) &&
    text.includes(pcName) &&
    /dano/i.test(text)
  );
}

export function sessionLogSlice(
  entries: readonly SkirmishLogEntry[],
  revealedCount: number,
): SkirmishLogEntry[] {
  const end = Math.max(0, Math.min(revealedCount, entries.length));
  return entries.slice(0, end);
}

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { SkirmishLogEntry } from "@/features/skirmish/skirmishes/api/skirmishes.schema";
import {
  prefersReducedMotion,
  sessionLogSlice,
  SKIRMISH_LOG_REVEAL_MS,
} from "@/features/skirmish/skirmishes/lib/skirmish-combat-playback";

export function useSkirmishLogPlayback(
  entries: readonly SkirmishLogEntry[],
  ready: boolean,
) {
  const baselineRef = useRef<number | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const countRef = useRef(0);
  const logKey = `${entries.length}:${entries.at(-1)?.at ?? ""}:${entries.at(-1)?.text ?? ""}`;

  useLayoutEffect(() => {
    if (!ready) return;
    if (baselineRef.current === null) {
      baselineRef.current = entries.length;
      setRevealedCount(entries.length);
      countRef.current = entries.length;
    }
  }, [ready, entries.length]);

  useEffect(() => {
    countRef.current = revealedCount;
  }, [revealedCount]);

  useEffect(() => {
    if (!ready || baselineRef.current === null) return;
    const total = entries.length;
    if (total <= countRef.current) {
      setRevealedCount(total);
      return;
    }
    if (prefersReducedMotion()) {
      setRevealedCount(total);
      return;
    }
    const timer = window.setInterval(() => {
      setRevealedCount((current) => {
        if (current >= total) {
          window.clearInterval(timer);
          return current;
        }
        const next = current + 1;
        if (next >= total) window.clearInterval(timer);
        return next;
      });
    }, SKIRMISH_LOG_REVEAL_MS);
    return () => window.clearInterval(timer);
  }, [ready, logKey, entries.length]);

  const baseline = baselineRef.current ?? 0;
  const revealed = sessionLogSlice(entries, revealedCount);
  const playing = ready && revealedCount < entries.length;

  return {
    revealed,
    baseline,
    latest: revealed.at(-1) ?? null,
    playing,
  };
}

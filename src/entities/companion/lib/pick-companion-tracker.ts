import type { CompanionTracker } from "@/entities/companion/types";

export function pickCompanionTracker(
  trackers: readonly CompanionTracker[] | undefined,
  templateSlug: string | null,
): CompanionTracker | null {
  if (!trackers?.length) return null;
  if (templateSlug) {
    return (
      trackers.find((row) => row.templateSlug === templateSlug) ??
      trackers[0] ??
      null
    );
  }
  return trackers[0] ?? null;
}

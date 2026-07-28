"use client";

import type { resolveSpellcastingUiProfile } from "@/features/create-character/lib/class-spellcasting-ui";
import type { countSpellsByType } from "@/features/create-character/lib/wizard-spell-selection";
import { cn } from "@/shared/lib/utils";

type SpellResourcesPanelProps = {
  profile: ReturnType<typeof resolveSpellcastingUiProfile>;
  counts: ReturnType<typeof countSpellsByType>;
  cantripMax: number | null;
  leveledKnownMax: number | null;
  leveledPreparedMax: number | null;
  channelMax: number | null;
  slotLines: { level: string; count: number }[];
  patternSlug?: string;
};

export function SpellResourcesPanel({
  profile,
  counts,
  cantripMax,
  leveledKnownMax,
  leveledPreparedMax,
  channelMax,
  slotLines,
  patternSlug,
}: SpellResourcesPanelProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="space-y-2 rounded-lg border p-3">
        <p className="text-xs font-medium">Cotas</p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {profile.showCantripPicker && cantripMax != null ? (
            <QuotaMeter
              label={profile.cantripQuotaLabel}
              used={counts.cantrips}
              max={cantripMax}
            />
          ) : null}
          <QuotaMeter
            label={profile.leveledPrimaryQuotaLabel}
            used={
              profile.showWizardDualPick
                ? counts.leveledKnown
                : profile.leveledPrimaryQuotaLabel
                      .toLowerCase()
                      .includes("preparad")
                  ? counts.leveledPrepared
                  : counts.leveledKnown
            }
            max={
              profile.showWizardDualPick
                ? leveledKnownMax
                : profile.leveledPrimaryQuotaLabel
                      .toLowerCase()
                      .includes("preparad")
                  ? leveledPreparedMax
                  : leveledKnownMax
            }
          />
          {profile.leveledSecondaryQuotaLabel ? (
            <QuotaMeter
              label={profile.leveledSecondaryQuotaLabel}
              used={counts.leveledPrepared}
              max={leveledPreparedMax}
            />
          ) : null}
          {profile.extraResourceLabel &&
          channelMax != null &&
          channelMax > 0 ? (
            <p className="text-[11px] text-muted-foreground sm:col-span-2">
              {profile.extraResourceLabel}: {channelMax}/descanso
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5 rounded-lg border p-3">
        <p className="text-xs font-medium">Espaços</p>
        {slotLines.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {slotLines.map(({ level, count }) => (
              <div
                key={level}
                className={cn(
                  "flex min-w-[3.5rem] flex-col items-center rounded-md border px-1.5 py-1 text-center",
                  patternSlug === "pact" && "border-primary/40 bg-primary/5",
                )}
              >
                <span className="text-[10px] text-muted-foreground">
                  {patternSlug === "pact" ? "Pacto" : `C${level}`}
                </span>
                <span className="text-base font-semibold tabular-nums">
                  {count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Sem espaços neste nível.
          </p>
        )}
      </div>
    </div>
  );
}

function QuotaMeter({
  label,
  used,
  max,
}: {
  label: string;
  used: number;
  max: number | null;
}) {
  const ratio = max != null && max > 0 ? Math.min(used / max, 1) : 0;
  const over = max != null && used > max;

  return (
    <div className="space-y-1.5 rounded-lg border px-3 py-2">
      <div className="flex justify-between gap-2 text-xs">
        <span className="font-medium">{label}</span>
        <span className={cn(over && "text-destructive", "tabular-nums")}>
          {used}
          {max != null ? ` / ${max}` : " / —"}
        </span>
      </div>
      {max != null ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              over ? "bg-destructive" : "bg-primary",
            )}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

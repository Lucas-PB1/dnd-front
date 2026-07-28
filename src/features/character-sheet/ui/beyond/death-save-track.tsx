"use client";

import { cn } from "@/shared/lib/utils";

type DeathSaveTrackProps = {
  label: string;
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  tone?: "default" | "danger";
};

export function DeathSaveTrack({
  label,
  value,
  onChange,
  disabled,
  tone = "default",
}: DeathSaveTrackProps) {
  return (
    <div className="rounded-lg border border-border/70 bg-card/70 px-3 py-2">
      <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-2 flex gap-1.5">
        {[1, 2, 3].map((pip) => {
          const filled = value >= pip;
          return (
            <button
              key={pip}
              type="button"
              disabled={disabled}
              aria-label={`${label}: ${pip}`}
              title={filled ? `Definir como ${pip - 1}` : `Definir como ${pip}`}
              onClick={() => onChange(filled && value === pip ? pip - 1 : pip)}
              className={cn(
                "size-4 rounded-full border transition-colors disabled:opacity-50",
                filled
                  ? tone === "danger"
                    ? "border-destructive bg-destructive"
                    : "border-primary bg-primary"
                  : "border-border/80 bg-muted/30 hover:border-primary/50",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

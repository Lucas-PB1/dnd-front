"use client";

import { cn } from "@/shared/lib/utils";

type CombatToggleChipProps = {
  label: string;
  active: boolean;
  disabled?: boolean;
  title?: string;
  onToggle: () => void;
};

/** Chip liga/desliga para flags de combate (Fúria, Imprudente, dano situacional). */
export function CombatToggleChip({
  label,
  active,
  disabled = false,
  title,
  onToggle,
}: CombatToggleChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium transition-colors",
        active
          ? "border-primary/50 bg-primary/15 text-primary"
          : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
        disabled && "pointer-events-none opacity-50",
      )}
      aria-pressed={active}
      title={title}
      disabled={disabled}
      onClick={onToggle}
    >
      {label}
    </button>
  );
}

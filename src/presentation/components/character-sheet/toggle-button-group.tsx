"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToggleButtonGroupProps = {
  label: string;
  options: { id: string; label: string }[];
  selected: string[];
  max: number;
  onChange: (ids: string[]) => void;
  disabled?: boolean;
};

export function ToggleButtonGroup({
  label,
  options,
  selected,
  max,
  onChange,
  disabled = false,
}: ToggleButtonGroupProps) {
  function toggle(id: string) {
    if (disabled) {
      return;
    }

    if (selected.includes(id)) {
      onChange(selected.filter((entry) => entry !== id));
      return;
    }

    if (selected.length < max) {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label} ({selected.length}/{max})
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isOn = selected.includes(option.id);
          const isDisabled = disabled || (!isOn && selected.length >= max);

          return (
            <Button
              key={option.id}
              type="button"
              size="sm"
              variant={isOn ? "default" : "outline"}
              disabled={isDisabled}
              className={cn("h-8", isOn && "border-primary")}
              onClick={() => toggle(option.id)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

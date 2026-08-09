"use client";

import { sorcererMetamagicLimit } from "@/features/character/character-sheet/lib/sorcerer/metamagic";
import type { MetamagicOption } from "@/features/catalog/metamagic-catalog/api/metamagics.api";
import { cn } from "@/shared/lib/cn";

type MetamagicPickerProps = {
  level: number;
  selectedSlugs: string[];
  onChange: (slugs: string[]) => void;
  catalog: readonly MetamagicOption[];
  className?: string;
};

export function MetamagicPicker({
  level,
  selectedSlugs,
  onChange,
  catalog,
  className,
}: MetamagicPickerProps) {
  const limit = sorcererMetamagicLimit(level);
  const selected = new Set(selectedSlugs);

  function toggle(slug: string) {
    if (selected.has(slug)) {
      onChange(selectedSlugs.filter((item) => item !== slug));
      return;
    }
    if (selectedSlugs.length >= limit) return;
    onChange([...selectedSlugs, slug]);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm text-muted-foreground">
        Escolha {limit} opção(ões) de Metamagia (nível {level}). Selecionadas:{" "}
        {selectedSlugs.length}/{limit}.
      </p>
      <ul className="space-y-1.5">
        {catalog.map((option) => {
          const checked = selected.has(option.slug);
          const disabled = !checked && selectedSlugs.length >= limit;
          return (
            <li key={option.slug}>
              <label
                className={cn(
                  "flex cursor-pointer gap-2 rounded-md border border-border/60 px-3 py-2 text-sm",
                  checked && "border-primary/50 bg-primary/5",
                  disabled && "opacity-50",
                )}
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(option.slug)}
                />
                <span className="min-w-0">
                  <span className="font-medium">
                    {option.name}{" "}
                    <span className="text-muted-foreground font-normal">
                      ({option.cost} pt)
                    </span>
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

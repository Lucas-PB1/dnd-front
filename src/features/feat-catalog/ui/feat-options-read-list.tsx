import type { FeatOption } from "@/entities/character/sheet-types";
import type { FeatOptionDefinition } from "@/entities/feat/types";

export function sortFeatOptionsByDefinition(
  options: FeatOption[],
  defs: FeatOptionDefinition[],
): FeatOption[] {
  const order = new Map(defs.map((def) => [def.optionKey, def.sortOrder]));
  return [...options].sort((a, b) => {
    const left = order.get(a.optionKey) ?? 999;
    const right = order.get(b.optionKey) ?? 999;
    if (left !== right) return left - right;
    return a.optionKey.localeCompare(b.optionKey);
  });
}

type FeatOptionsReadListProps = {
  options: FeatOption[];
  defs: FeatOptionDefinition[];
  resolveFeatOption: (option: FeatOption) => { label: string; value: string };
  loading?: boolean;
  className?: string;
};

export function FeatOptionsReadList({
  options,
  defs,
  resolveFeatOption,
  loading = false,
  className,
}: FeatOptionsReadListProps) {
  if (options.length === 0) return null;

  const sorted = sortFeatOptionsByDefinition(options, defs);

  return (
    <dl className={className ?? "mt-2 grid gap-1.5 text-xs text-muted-foreground"}>
      {sorted.map((option) => {
        const display = resolveFeatOption(option);
        return (
          <div key={`${option.optionKey}-${option.valueId}`} className="flex gap-2">
            <dt className="shrink-0">{display.label}:</dt>
            <dd className="text-foreground">
              {loading ? option.valueId : display.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

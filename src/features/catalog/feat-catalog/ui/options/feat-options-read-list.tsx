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
    <div className={className ?? "space-y-2 border-t border-border/50 pt-3"}>
      <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        Escolhas
      </p>
      <dl className="space-y-1.5 text-sm">
        {sorted.map((option) => {
          const display = resolveFeatOption(option);
          return (
            <div
              key={`${option.optionKey}-${option.valueId}`}
              className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5"
            >
              <dt className="text-muted-foreground">{display.label}</dt>
              <dd className="font-medium text-foreground">
                {loading ? option.valueId : display.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

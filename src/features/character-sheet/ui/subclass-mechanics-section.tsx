"use client";

import { useMemo } from "react";

import { isSubclassRequired } from "@/entities/character/lib/subclass";
import type { SubclassMechanic } from "@/entities/subclass/types";
import { useSubclassMechanics } from "@/features/class-catalog/api/use-classes";
import type { SheetReadSectionProps } from "@/features/character-sheet/ui/sheet-section-types";
import { cn } from "@/shared/lib/utils";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";

function formatSubclassMechanicDetail(
  mechanic: SubclassMechanic,
): string | null {
  const parts: string[] = [];
  if (mechanic.featureKind) {
    parts.push(mechanic.featureKind);
  }
  if (mechanic.resourceName) {
    let resource = mechanic.resourceName;
    if (mechanic.resourceUnlockLevel != null) {
      resource += ` (nv. ${mechanic.resourceUnlockLevel})`;
    }
    parts.push(resource);
  }
  if (mechanic.fixedMax != null) {
    parts.push(`máx. ${mechanic.fixedMax}`);
  } else if (mechanic.maxFormula) {
    parts.push(`máx. ${mechanic.maxFormula}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function SubclassMechanicsSection({
  character,
}: Pick<SheetReadSectionProps, "character">) {
  const enabled =
    isSubclassRequired(character.level) && !!character.subclassSlug;
  const mechanicsQuery = useSubclassMechanics(
    character.subclassSlug ?? "",
    enabled,
  );

  const selectedOptionKeys = useMemo(
    () => new Set(character.subclassOptions.map((o) => o.optionKey)),
    [character.subclassOptions],
  );

  const byLevel = useMemo(() => {
    const map = new Map<number, SubclassMechanic[]>();
    for (const mechanic of mechanicsQuery.data?.data ?? []) {
      if (mechanic.featureLevel > character.level) continue;
      const list = map.get(mechanic.featureLevel) ?? [];
      list.push(mechanic);
      map.set(mechanic.featureLevel, list);
    }
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [character.level, mechanicsQuery.data?.data]);

  if (!enabled) {
    return (
      <p className="text-sm text-muted-foreground">
        Subclasse disponível a partir do nível 3.
      </p>
    );
  }

  if (mechanicsQuery.isPending) {
    return (
      <p className="text-sm text-muted-foreground">
        Carregando mecânicas de subclasse…
      </p>
    );
  }

  if (byLevel.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma mecânica de subclasse até o nível atual.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {byLevel.map(([level, mechanics]) => (
        <section key={level} className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Nível {level}
          </h4>
          <ul className="space-y-1.5">
            {mechanics.map((mechanic) => {
              const detail = formatSubclassMechanicDetail(mechanic);
              const matchesOption =
                mechanic.optionKey != null &&
                selectedOptionKeys.has(mechanic.optionKey);

              return (
                <li
                  key={`${level}-${mechanic.featureName}-${mechanic.optionKey ?? ""}`}
                >
                  <CollapsibleCard
                    title={mechanic.featureName}
                    subtitle={
                      matchesOption ? "Opção escolhida" : (detail ?? undefined)
                    }
                    size="compact"
                    defaultOpen={false}
                    className={cn(
                      "bg-background/50",
                      matchesOption && "border-primary/40",
                    )}
                  >
                    {detail ? (
                      <p className="text-sm text-muted-foreground">{detail}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Sem detalhes adicionais.
                      </p>
                    )}
                  </CollapsibleCard>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

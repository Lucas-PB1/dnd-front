"use client";

import { useMemo } from "react";

import { aggregateTraitTakes } from "@/entities/heritage";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";
import { cn } from "@/shared/lib/utils";

export type TraditionalTraitDisplay = {
  traitSlug: string;
  traitName: string;
  categoryLabel: string;
  benefitBase: string | null;
  benefitImproved: string | null;
};

const CATEGORY_ORDER = ["Combate", "Exploração", "Interpretação"] as const;

type HeritageTraditionalTraitsPanelProps = {
  traits: TraditionalTraitDisplay[];
  /** Slugs atualmente nos 8 slots (heritageChoices). */
  selectedTraitSlugs: string[];
  onDoubleChange: (doubleSlug: string, replaceSlug: string) => void;
  onClearDouble: (doubleSlug: string, restoreSlug: string) => void;
  onReplaceChange: (
    doubleSlug: string,
    fromSlug: string,
    toSlug: string,
  ) => void;
};

function categoryLabelFromHint(category: string, hint: string): string {
  const raw = (hint || category || "").trim();
  if (/combat/i.test(raw) || raw === "Combate") return "Combate";
  if (/explor/i.test(raw) || raw === "Exploração") return "Exploração";
  if (/role|interp/i.test(raw) || raw === "Interpretação") return "Interpretação";
  return raw || "Outro";
}

export function groupTraditionalTraits(traits: TraditionalTraitDisplay[]) {
  const groups = new Map<string, TraditionalTraitDisplay[]>();
  for (const trait of traits) {
    const label = trait.categoryLabel;
    const list = groups.get(label) ?? [];
    list.push(trait);
    groups.set(label, list);
  }
  return CATEGORY_ORDER.filter((label) => groups.has(label)).map(
    (label) => [label, groups.get(label)!] as const,
  );
}

export function toTraditionalTraitDisplay(
  trait: {
    traitSlug: string;
    traitName: string;
    category: string;
    categoryHint: string;
  },
  benefits?: { benefitBase: string | null; benefitImproved: string | null },
): TraditionalTraitDisplay {
  return {
    traitSlug: trait.traitSlug,
    traitName: trait.traitName.replace(/\.$/, ""),
    categoryLabel: categoryLabelFromHint(trait.category, trait.categoryHint),
    benefitBase: benefits?.benefitBase ?? null,
    benefitImproved: benefits?.benefitImproved ?? null,
  };
}

function resolveMissingInCategory(
  categoryTraits: TraditionalTraitDisplay[],
  takeCountBySlug: Map<string, number>,
): string | null {
  const missing = categoryTraits.find(
    (trait) => (takeCountBySlug.get(trait.traitSlug) ?? 0) === 0,
  );
  return missing?.traitSlug ?? null;
}

export function HeritageTraditionalTraitsPanel({
  traits,
  selectedTraitSlugs,
  onDoubleChange,
  onClearDouble,
  onReplaceChange,
}: HeritageTraditionalTraitsPanelProps) {
  const grouped = groupTraditionalTraits(traits);
  const takeCountBySlug = useMemo(() => {
    const aggregated = aggregateTraitTakes(
      selectedTraitSlugs.map((choiceSlug, index) => ({
        choiceKind: `heritage_trait_${index + 1}`,
        choiceSlug,
      })),
    );
    return new Map(aggregated.map((entry) => [entry.traitSlug, entry.takeCount]));
  }, [selectedTraitSlugs]);
  const hasActiveSelections = useMemo(
    () => selectedTraitSlugs.some((slug) => slug.trim()),
    [selectedTraitSlugs],
  );

  if (traits.length === 0) {
    return (
      <WizardFormSection title="Traços tradicionais" compact>
        <p className="text-sm text-muted-foreground">
          Esta variante não tem build tradicional no livro.
        </p>
      </WizardFormSection>
    );
  }

  return (
    <WizardFormSection title="Traços tradicionais" compact>
      <p className="text-sm text-muted-foreground">
        Pacote do livro ({traits.length} traços). Para o benefício aprimorado,
        repita um traço no lugar de outro do mesmo tipo (Combate, Exploração ou
        Interpretação).
      </p>
      <div className="space-y-4">
        {grouped.map(([category, list]) => {
          const missingSlug = resolveMissingInCategory(list, takeCountBySlug);
          const doubled = list.find(
            (trait) => (takeCountBySlug.get(trait.traitSlug) ?? 0) >= 2,
          );

          return (
            <div key={category} className="space-y-2">
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                {category}
              </p>
              <div className="space-y-2">
                {list
                  .filter((trait) =>
                    hasActiveSelections
                      ? (takeCountBySlug.get(trait.traitSlug) ?? 0) > 0
                      : true,
                  )
                  .map((trait) => {
                  const takes = takeCountBySlug.get(trait.traitSlug) ?? 0;
                  const canImprove =
                    Boolean(trait.benefitImproved) && list.length >= 2;
                  const isDoubled = takes >= 2;
                  const replaceOptions = list.filter(
                    (other) => other.traitSlug !== trait.traitSlug,
                  );

                  return (
                    <CollapsibleCard
                      key={trait.traitSlug}
                      title={trait.traitName}
                      subtitle={
                        isDoubled
                          ? "2× — benefício aprimorado ativo"
                          : undefined
                      }
                    >
                      <div className="space-y-3">
                        {trait.benefitBase ? (
                          <PhbProse
                            text={trait.benefitBase}
                            className="text-sm"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Sem descrição adicional.
                          </p>
                        )}
                        {trait.benefitImproved ? (
                          <div
                            className={cn(
                              "space-y-1 border-t border-border/60 pt-3",
                              !isDoubled && "opacity-70",
                            )}
                          >
                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                              Benefício aprimorado (2×)
                              {isDoubled ? " — ativo" : ""}
                            </p>
                            <PhbProse
                              text={trait.benefitImproved}
                              className="text-sm text-muted-foreground"
                            />
                          </div>
                        ) : null}

                        {canImprove ? (
                          <div className="space-y-2 border-t border-border/60 pt-3">
                            <label
                              className={cn(
                                "flex items-center gap-2 text-sm",
                                Boolean(doubled) && !isDoubled
                                  ? "cursor-not-allowed opacity-60"
                                  : "cursor-pointer",
                              )}
                            >
                              <input
                                type="checkbox"
                                className="size-4"
                                checked={isDoubled}
                                disabled={Boolean(doubled) && !isDoubled}
                                onChange={(event) => {
                                  if (event.target.checked) {
                                    const fallback =
                                      replaceOptions[0]?.traitSlug ?? "";
                                    if (fallback) {
                                      onDoubleChange(trait.traitSlug, fallback);
                                    }
                                    return;
                                  }
                                  if (missingSlug) {
                                    onClearDouble(trait.traitSlug, missingSlug);
                                  }
                                }}
                              />
                              Aprimorar (2×) — mesmo tipo
                            </label>
                            {isDoubled && missingSlug ? (
                              <CatalogSelect
                                id={`heritage-double-replace-${trait.traitSlug}`}
                                label="Em troca de"
                                options={replaceOptions.map((other) => ({
                                  value: other.traitSlug,
                                  label: other.traitName,
                                }))}
                                value={missingSlug}
                                onChange={(event) => {
                                  const nextReplace = event.target.value;
                                  if (!nextReplace) return;
                                  onReplaceChange(
                                    trait.traitSlug,
                                    missingSlug,
                                    nextReplace,
                                  );
                                }}
                              />
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </CollapsibleCard>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </WizardFormSection>
  );
}

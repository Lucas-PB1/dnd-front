"use client";

import {
  featInstanceKey,
  formatCharacterFeatLabel,
} from "@/entities/character/lib/character-feat";
import type { useStepReview } from "@/features/create-character/lib/use-step-review";
import { WizardFormSection } from "@/features/create-character/ui/wizard-form-section";
import { FeatOptionsReadList } from "@/features/feat-catalog/ui/feat-options-read-list";

type ReviewData = ReturnType<typeof useStepReview>;

export function ReviewFeatsSection({ data }: { data: ReviewData }) {
  const {
    values,
    previewFeats,
    featNameBySlug,
    optionsByFeatInstance,
    asiLevelByFeatKey,
    originFeatSlug,
    resolveFeatOption,
    featOptionDefsFor,
    featOptionsLoading,
  } = data;

  return (
    <WizardFormSection title="Talentos" compact>
      {previewFeats.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum talento nesta ficha.
        </p>
      ) : (
        <ul className="space-y-2">
          {previewFeats.map((feat) => {
            const key = featInstanceKey(feat.featSlug, feat.instanceIndex);
            const options = optionsByFeatInstance[key] ?? [];
            const slotLevel = asiLevelByFeatKey.get(key) ?? null;
            const isOrigin =
              feat.featSlug === originFeatSlug ||
              values.speciesChoices?.some(
                (c) =>
                  c.choiceKind === "human_origin_feat" &&
                  c.choiceSlug === feat.featSlug,
              );
            return (
              <li
                key={key}
                className="rounded-lg border border-border/80 px-3 py-2"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">
                    {formatCharacterFeatLabel(
                      feat,
                      featNameBySlug,
                      previewFeats,
                    )}
                  </p>
                  {slotLevel != null || isOrigin ? (
                    <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
                      {slotLevel != null ? `ASI nv. ${slotLevel}` : "Origem"}
                    </span>
                  ) : null}
                </div>
                <FeatOptionsReadList
                  options={options}
                  defs={featOptionDefsFor(feat.featSlug)}
                  resolveFeatOption={resolveFeatOption}
                  loading={featOptionsLoading}
                />
              </li>
            );
          })}
        </ul>
      )}
    </WizardFormSection>
  );
}

export function ReviewEquipmentSection({ data }: { data: ReviewData }) {
  const {
    values,
    labels,
    equipmentBySource,
    resolvePackageLabel,
    resolveEquipmentItemName,
  } = data;

  return (
    <WizardFormSection title="Equipamento inicial" compact>
      {values.equipment.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum pacote selecionado.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(["class", "background"] as const).map((source) => {
            const items = equipmentBySource[source];
            if (items.length === 0) return null;
            const packageSlug = items[0]?.packageSlug ?? "";
            const packageItems = items.filter((e) => e.itemSlug);
            const sourceName =
              source === "class"
                ? (labels.identity.className ?? "Classe")
                : (labels.identity.backgroundName ?? "Antecedente");

            return (
              <div
                key={source}
                className="space-y-2 rounded-lg border border-border/80 p-3"
              >
                <div>
                  <p className="text-sm font-medium">{sourceName}</p>
                  <p className="text-xs text-muted-foreground">
                    {resolvePackageLabel(source, packageSlug)}
                  </p>
                </div>
                {packageItems.length > 0 ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {packageItems.map((item, index) => (
                      <li
                        key={`${item.itemSlug}-${index}`}
                        className="rounded-md border border-border/80 bg-background/80 px-2 py-1 text-[11px]"
                      >
                        {item.quantity && item.quantity > 1
                          ? `${item.quantity}× `
                          : null}
                        {resolveEquipmentItemName(
                          source,
                          item.packageSlug,
                          item.itemSlug,
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sem itens catalogados neste pacote.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </WizardFormSection>
  );
}

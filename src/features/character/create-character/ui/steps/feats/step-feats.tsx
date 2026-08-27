"use client";

import type { Control, UseFormSetValue } from "react-hook-form";

import type { FeatOption } from "@/entities/character/sheet-types";
import type { FeatSummary } from "@/entities/feat/types";
import { asiSlotGridClassName } from "@/features/character/create-character/lib/feats/feat-options-prune";
import { useStepFeats } from "@/features/character/create-character/lib/feats/use-step-feats";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import { FeatChoicePreview } from "@/features/character/create-character/ui/steps/feats/feat-choice-preview";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";
import { FeatOptionsEditor } from "@/features/catalog/feat-catalog/ui/options/feat-options-editor";

type StepFeatsProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
  error?: string;
};

function findFeat(
  feats: FeatSummary[] | undefined,
  slug: string | null | undefined,
): FeatSummary | undefined {
  const key = slug?.trim();
  if (!key) return undefined;
  return feats?.find((feat) => feat.slug === key);
}

export function StepFeats({ control, setValue, error }: StepFeatsProps) {
  const data = useStepFeats(control, setValue);
  const catalog = data.feats.data?.data;

  if (!data.backgroundSlug) {
    return (
      <p className="text-sm text-muted-foreground">
        Escolha um antecedente na etapa Identidade.
      </p>
    );
  }

  if (data.backgroundDetail.isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando antecedente…</p>
    );
  }

  if (
    !data.showOriginSection &&
    !data.showAsiSection &&
    !data.showFightingStyleSection
  ) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum talento para configurar neste nível.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.showFightingStyleSection ? (
        <WizardFormSection title="Estilo de Luta" compact>
          {data.feats.isPending || data.classDetail.isPending ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : (
            <div className="space-y-1.5">
              <CatalogSelect
                id="fighting-style-feat"
                label="Estilo de Luta"
                options={[
                  { value: "", label: "Escolha…" },
                  ...data.fightingStyleOptions.map((feat) => ({
                    value: feat.slug,
                    label: feat.name,
                  })),
                ]}
                value={data.fightingStyleSlug}
                onChange={(e) => data.setFightingStyle(e.target.value)}
              />
              <FeatChoicePreview
                feat={findFeat(catalog, data.fightingStyleSlug)}
                loading={data.feats.isPending}
                subtitle="Estilo de luta"
              />
            </div>
          )}
        </WizardFormSection>
      ) : null}

      {data.showAsiSection ? (
        <WizardFormSection title="ASI / talentos" compact>
          {data.feats.isPending ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : (
            <div className="space-y-3">
              <div className={asiSlotGridClassName(data.asiLevels.length)}>
                {data.asiLevels.map((asiLevel, index) => (
                  <CatalogSelect
                    key={asiLevel}
                    id={`asi-feat-slot-${asiLevel}`}
                    label={`Nv. ${asiLevel}`}
                    options={[
                      {
                        value: "",
                        label: "Melhoria manual",
                      },
                      ...data.sortedSlotFeatOptions(index).map((feat) => ({
                        value: feat.slug,
                        label:
                          feat.slug === data.ASI_FEAT_SLUG
                            ? `${feat.name} (+2/+1)`
                            : feat.repeatable
                              ? `${feat.name} (rep.)`
                              : feat.name,
                      })),
                    ]}
                    value={data.asiFeatSlotSlugs[index] ?? ""}
                    onChange={(e) => data.updateAsiSlot(index, e.target.value)}
                  />
                ))}
              </div>
              {data.asiFeatSlotSlugs.map((slug, index) => {
                const feat = findFeat(catalog, slug);
                if (!feat) return null;
                return (
                  <FeatChoicePreview
                    key={`${slug}-${index}`}
                    feat={feat}
                    subtitle={`Talento · nv. ${data.asiLevels[index]}`}
                  />
                );
              })}
            </div>
          )}
        </WizardFormSection>
      ) : null}

      {data.showOriginSection ? (
        <WizardFormSection title="Origem" compact>
          {data.showOriginPick ? (
            data.feats.isPending ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : (
              <div className="space-y-1.5">
                <CatalogSelect
                  id="background-origin-feat"
                  label="Talento de origem"
                  options={[
                    { value: "", label: "Escolha…" },
                    ...data.originFeatChoiceOptions.map((feat) => ({
                      value: feat.slug,
                      label: feat.name,
                    })),
                  ]}
                  value={data.originFeatPick}
                  onChange={(e) => data.setBackgroundOriginFeat(e.target.value)}
                />
                <FeatChoicePreview
                  feat={findFeat(catalog, data.originFeatPick)}
                  subtitle="Origem"
                />
              </div>
            )
          ) : (
            <div className="space-y-1.5">
              <p className="text-sm">
                <span className="font-medium">
                  {data.originFeatName ?? data.originFeatSlug}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  · {data.backgroundDetail.data?.name}
                </span>
              </p>
              <FeatChoicePreview
                feat={findFeat(catalog, data.originFeatSlug)}
                subtitle="Origem"
              />
            </div>
          )}
        </WizardFormSection>
      ) : null}

      {data.previewFeats.length > 0 ? (
        <WizardFormSection title="Opções" compact>
          <FeatOptionsEditor
            characterFeats={data.previewFeats}
            featNameBySlug={data.featNameBySlug}
            value={data.featOptions}
            characterLevel={data.level}
            classSlug={data.classSlug}
            grantedSkillSlugs={data.grantedSkillSlugs}
            grantedToolSlugs={data.grantedToolSlugs}
            onChange={(next: FeatOption[]) => data.setFeatOptions(next)}
          />
        </WizardFormSection>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

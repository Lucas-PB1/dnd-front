"use client";

import type { Control, UseFormSetValue } from "react-hook-form";

import type { FeatOption } from "@/entities/character/sheet-types";
import { asiSlotGridClassName } from "@/features/character/create-character/lib/feats/feat-options-prune";
import { useStepFeats } from "@/features/character/create-character/lib/feats/use-step-feats";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";
import { FeatOptionsEditor } from "@/features/catalog/feat-catalog/ui/options/feat-options-editor";

type StepFeatsProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
  error?: string;
};

export function StepFeats({ control, setValue, error }: StepFeatsProps) {
  const data = useStepFeats(control, setValue);

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
          )}
        </WizardFormSection>
      ) : null}

      {data.showAsiSection ? (
        <WizardFormSection title="ASI / talentos" compact>
          {data.feats.isPending ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : (
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
          )}
        </WizardFormSection>
      ) : null}

      {data.showOriginSection ? (
        <WizardFormSection title="Origem" compact>
          <p className="text-sm">
            <span className="font-medium">
              {data.originFeatName ?? data.originFeatSlug}
            </span>
            <span className="text-muted-foreground">
              {" "}
              · {data.backgroundDetail.data?.name}
            </span>
          </p>
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

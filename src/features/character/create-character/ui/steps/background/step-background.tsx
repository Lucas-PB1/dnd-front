"use client";

import { useEffect, useMemo } from "react";
import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import {
  useBackgroundDetail,
  useBackgroundSkills,
  useBackgroundTools,
} from "@/features/catalog/background-catalog/api/use-backgrounds";
import { useFeats } from "@/features/catalog/reference-catalog/api/use-reference";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import { FeatChoicePreview } from "@/features/character/create-character/ui/steps/feats/feat-choice-preview";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";

type StepBackgroundProps = {
  control: Control<CreateCharacterInput>;
  errors: FieldErrors<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
};

export function StepBackground({
  control,
  errors,
  setValue,
}: StepBackgroundProps) {
  const backgroundSlug = useWatch({
    control,
    name: "backgroundSlug",
    defaultValue: "",
  });
  const toolSlug = useWatch({
    control,
    name: "backgroundToolItemSlug",
    defaultValue: "",
  });

  const detail = useBackgroundDetail(backgroundSlug, !!backgroundSlug);
  const skills = useBackgroundSkills(backgroundSlug, !!backgroundSlug);
  const needsToolChoice = detail.data?.toolProficiencyKind === "choice";
  const tools = useBackgroundTools(backgroundSlug, needsToolChoice);
  const feats = useFeats();

  useEffect(() => {
    if (!detail.data) return;
    if (
      detail.data.toolProficiencyKind === "fixed" &&
      detail.data.toolItemSlug
    ) {
      setValue("backgroundToolItemSlug", detail.data.toolItemSlug);
    }
  }, [detail.data, setValue]);

  const originFeat = useMemo(() => {
    const slug = detail.data?.originFeatSlug?.trim();
    if (!slug) return undefined;
    return feats.data?.data?.find((feat) => feat.slug === slug);
  }, [detail.data?.originFeatSlug, feats.data?.data]);

  if (!backgroundSlug) {
    return (
      <p className="text-sm text-muted-foreground">
        Escolha um antecedente na etapa Identidade.
      </p>
    );
  }

  if (detail.isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando antecedente…</p>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Não foi possível carregar o antecedente.
      </p>
    );
  }

  const bg = detail.data;
  const toolOptions = (tools.data?.data ?? []).map((tool) => ({
    value: tool.itemSlug,
    label: tool.itemName,
  }));
  const originFeatLabel =
    bg.originFeatName ??
    bg.originFeatSlug ??
    (bg.originFeatChoiceSlugs.length > 0
      ? "À escolha (etapa Talentos)"
      : "—");

  return (
    <WizardFormSection title={bg.name} compact>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Talento de origem</dt>
          <dd className="font-medium">{originFeatLabel}</dd>
        </div>
        {(skills.data?.data.length ?? 0) > 0 ? (
          <div>
            <dt className="text-xs text-muted-foreground">Perícias</dt>
            <dd>{skills.data!.data.map((s) => s.name).join(", ")}</dd>
          </div>
        ) : null}
        {bg.toolProficiencyKind === "fixed" ? (
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Ferramenta</dt>
            <dd className="font-medium">
              {bg.toolItemName ?? bg.toolItemSlug ?? "—"}
            </dd>
          </div>
        ) : null}
      </dl>

      {bg.originFeatSlug ? (
        <FeatChoicePreview
          feat={originFeat}
          loading={feats.isPending}
          subtitle="Talento de origem"
        />
      ) : null}

      {bg.toolProficiencyKind === "choice" ? (
        <CatalogSelect
          id="background-tool"
          label={
            bg.toolCategorySlug === "instrument"
              ? "Instrumento musical"
              : bg.toolCategorySlug === "kit"
                ? "Kit de jogos"
                : bg.toolCategorySlug === "artisan"
                  ? "Ferramentas de artesão"
                  : "Ferramenta"
          }
          options={toolOptions}
          isLoading={tools.isPending}
          value={toolSlug}
          onChange={(e) => setValue("backgroundToolItemSlug", e.target.value)}
          error={
            errors.backgroundToolItemSlug ??
            (tools.isError
              ? { message: "Não foi possível carregar as opções de ferramenta." }
              : undefined)
          }
        />
      ) : null}
    </WizardFormSection>
  );
}

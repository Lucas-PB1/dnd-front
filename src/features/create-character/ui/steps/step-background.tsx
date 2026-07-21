"use client";

import { useEffect } from "react";
import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import {
  useBackgroundDetail,
  useBackgroundSkills,
  useBackgroundTools,
} from "@/features/background-catalog/api/use-backgrounds";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import { WizardFormSection } from "@/features/create-character/ui/wizard-form-section";

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

  useEffect(() => {
    if (!detail.data) return;
    if (
      detail.data.toolProficiencyKind === "fixed" &&
      detail.data.toolItemSlug
    ) {
      setValue("backgroundToolItemSlug", detail.data.toolItemSlug);
    }
  }, [detail.data, setValue]);

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

  return (
    <WizardFormSection title={bg.name} compact>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Talento de origem</dt>
          <dd className="font-medium">
            {bg.originFeatName ?? bg.originFeatSlug ?? "—"}
          </dd>
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

      {bg.toolProficiencyKind === "choice" ? (
        <CatalogSelect
          id="background-tool"
          label="Ferramenta"
          options={toolOptions}
          isLoading={tools.isPending}
          value={toolSlug}
          onChange={(e) => setValue("backgroundToolItemSlug", e.target.value)}
          error={errors.backgroundToolItemSlug}
        />
      ) : null}
    </WizardFormSection>
  );
}

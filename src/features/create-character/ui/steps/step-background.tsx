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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";

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
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <Field>
          <FieldLabel>Talento de origem</FieldLabel>
          <FieldDescription>
            Concedido automaticamente pelo antecedente — a API inclui na ficha.
          </FieldDescription>
          <p className="rounded-lg border border-border px-3 py-2 text-sm font-medium">
            {bg.originFeatName ?? bg.originFeatSlug ?? "—"}
          </p>
        </Field>

        {(skills.data?.data.length ?? 0) > 0 ? (
          <Field>
            <FieldLabel>Perícias do antecedente</FieldLabel>
            <p className="text-sm text-muted-foreground">
              {skills.data!.data.map((s) => s.name).join(", ")}
            </p>
          </Field>
        ) : null}

        <Field>
          <FieldLabel>Proficiência em ferramenta</FieldLabel>
          <FieldDescription>
            {bg.toolProficiencyDescription ?? "Conforme o PHB 2024."}
          </FieldDescription>

          {bg.toolProficiencyKind === "fixed" ? (
            <p className="rounded-lg border border-border px-3 py-2 text-sm font-medium">
              {bg.toolItemName ?? bg.toolItemSlug ?? "—"}
            </p>
          ) : bg.toolProficiencyKind === "choice" ? (
            <CatalogSelect
              id="background-tool"
              label="Escolha a ferramenta"
              options={toolOptions}
              isLoading={tools.isPending}
              value={toolSlug}
              onChange={(e) =>
                setValue("backgroundToolItemSlug", e.target.value)
              }
              error={errors.backgroundToolItemSlug}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma ferramenta.</p>
          )}
        </Field>
      </FieldGroup>
    </div>
  );
}

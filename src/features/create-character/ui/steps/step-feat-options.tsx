"use client";

import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { FeatOption } from "@/entities/character/sheet-types";
import { useBackgroundDetail } from "@/features/background-catalog/api/use-backgrounds";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import { FeatOptionsEditor } from "@/features/feat-catalog/ui/feat-options-editor";

type StepFeatOptionsProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
  error?: string;
};

export function StepFeatOptions({
  control,
  setValue,
  error,
}: StepFeatOptionsProps) {
  const backgroundSlug = useWatch({
    control,
    name: "backgroundSlug",
    defaultValue: "",
  });
  const featOptions = useWatch({
    control,
    name: "featOptions",
    defaultValue: [],
  });

  const backgroundDetail = useBackgroundDetail(
    backgroundSlug,
    !!backgroundSlug,
  );
  const originFeatSlug = backgroundDetail.data?.originFeatSlug ?? null;
  const originFeatName = backgroundDetail.data?.originFeatName ?? null;

  if (!backgroundSlug) {
    return (
      <p className="text-sm text-muted-foreground">
        Escolha um antecedente na etapa Identidade.
      </p>
    );
  }

  if (backgroundDetail.isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando antecedente…</p>
    );
  }

  if (!originFeatSlug) {
    return (
      <p className="text-sm text-muted-foreground">
        O antecedente não concede talento com escolhas.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Configure o talento de origem concedido pelo antecedente. A API inclui o
        talento automaticamente na ficha.
      </p>
      <FeatOptionsEditor
        featSlugs={[originFeatSlug]}
        featNameBySlug={
          originFeatName ? { [originFeatSlug]: originFeatName } : undefined
        }
        value={featOptions}
        onChange={(next: FeatOption[]) => setValue("featOptions", next)}
      />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

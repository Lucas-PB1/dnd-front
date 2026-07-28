"use client";

import { useState } from "react";

import {
  useBackgroundDetail,
  useBackgroundTools,
} from "@/features/catalog/background-catalog/api/use-backgrounds";
import {
  EditFormShell,
  useSectionPatch,
  type EditFormProps,
} from "@/features/character/character-sheet/ui/edit/edit-form-shell";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";

export function EditBackgroundToolForm({
  character,
  onSuccess,
  onCancel,
}: EditFormProps) {
  const { patch, formError, submit } = useSectionPatch(character, onSuccess);
  const backgroundDetail = useBackgroundDetail(character.backgroundSlug, true);
  const needsToolChoice =
    backgroundDetail.data?.toolProficiencyKind === "choice";
  const backgroundTools = useBackgroundTools(
    character.backgroundSlug,
    needsToolChoice,
  );
  const [selected, setSelected] = useState(
    character.backgroundToolItemSlug ?? "",
  );

  if (backgroundDetail.isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando antecedente…</p>
    );
  }

  if (!needsToolChoice) {
    return (
      <p className="text-sm text-muted-foreground">
        Este antecedente não permite escolher ferramenta.
      </p>
    );
  }

  const toolOptions = (backgroundTools.data?.data ?? []).map((tool) => ({
    value: tool.itemSlug,
    label: tool.itemName,
  }));

  return (
    <EditFormShell
      isPending={patch.isPending}
      formError={formError}
      onCancel={onCancel}
      onSubmit={(e) => {
        e.preventDefault();
        if (!selected) return;
        submit({ backgroundToolItemSlug: selected });
      }}
    >
      <CatalogSelect
        id="edit-background-tool"
        label="Ferramenta do antecedente"
        options={toolOptions}
        isLoading={backgroundTools.isPending}
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      />
    </EditFormShell>
  );
}

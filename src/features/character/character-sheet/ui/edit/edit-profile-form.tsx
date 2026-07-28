"use client";

import { useState } from "react";

import {
  useSectionPatch,
  type EditFormProps,
} from "@/features/character/character-sheet/ui/edit/edit-form-shell";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import { useAlignments } from "@/features/catalog/reference-catalog/api/use-reference";
import { Button } from "@/shared/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

/** Metadados leves da ficha (nome / alinhamento) — sem trocar classe/espécie. */
export function EditProfileForm({
  character,
  onSuccess,
}: Pick<EditFormProps, "character" | "onSuccess">) {
  const { patch, formError, submit } = useSectionPatch(character, onSuccess);
  const alignments = useAlignments();
  const [name, setName] = useState(character.name);
  const [alignmentSlug, setAlignmentSlug] = useState(
    character.alignmentSlug ?? "",
  );

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        submit({
          name: trimmed,
          alignmentSlug: alignmentSlug || undefined,
        });
      }}
    >
      <FieldGroup className="gap-3 sm:grid sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="sheet-profile-name">Nome</FieldLabel>
          <Input
            id="sheet-profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
          />
        </Field>
        <CatalogSelect
          id="sheet-profile-alignment"
          label="Alinhamento"
          options={[
            { value: "", label: "Sem alinhamento" },
            ...(alignments.data?.data ?? []).map((row) => ({
              value: row.slug,
              label: row.name,
            })),
          ]}
          value={alignmentSlug}
          onChange={(e) => setAlignmentSlug(e.target.value)}
          disabled={alignments.isPending}
        />
      </FieldGroup>
      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={patch.isPending}>
        {patch.isPending ? "Salvando…" : "Salvar personagem"}
      </Button>
    </form>
  );
}

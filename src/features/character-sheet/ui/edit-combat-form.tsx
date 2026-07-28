"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { UpdateCharacterPayload } from "@/entities/character/types";
import {
  EditFormShell,
  useSectionPatch,
  type EditFormProps,
} from "@/features/character-sheet/ui/edit-form-shell";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

const combatSchema = z.object({
  hitPointsMax: z.number().int().min(0).optional(),
  hitPointsCurrent: z.number().int().min(0).optional(),
});

type CombatFormValues = z.infer<typeof combatSchema>;

export function EditCombatForm({
  character,
  onSuccess,
  onCancel,
}: EditFormProps) {
  const { patch, formError, submit } = useSectionPatch(character, onSuccess);

  const form = useForm<CombatFormValues>({
    resolver: zodResolver(combatSchema),
    defaultValues: {
      hitPointsMax: character.hitPointsMax ?? undefined,
      hitPointsCurrent: character.hitPointsCurrent ?? undefined,
    },
  });

  return (
    <EditFormShell
      isPending={patch.isPending}
      formError={formError}
      onCancel={onCancel}
      onSubmit={form.handleSubmit((values) => {
        const payload: UpdateCharacterPayload = {};
        if (values.hitPointsMax != null) {
          payload.hitPointsMax = values.hitPointsMax;
        }
        if (values.hitPointsCurrent != null) {
          payload.hitPointsCurrent = values.hitPointsCurrent;
        }
        return submit(payload);
      })}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="edit-hp-max">PV máximos</FieldLabel>
          <Input
            id="edit-hp-max"
            type="number"
            min={0}
            {...form.register("hitPointsMax", { valueAsNumber: true })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="edit-hp-current">PV atuais</FieldLabel>
          <Input
            id="edit-hp-current"
            type="number"
            min={0}
            {...form.register("hitPointsCurrent", { valueAsNumber: true })}
          />
        </Field>
      </FieldGroup>
    </EditFormShell>
  );
}

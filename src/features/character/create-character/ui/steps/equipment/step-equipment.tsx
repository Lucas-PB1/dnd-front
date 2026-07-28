"use client";

import type { Control, UseFormSetValue } from "react-hook-form";

import { useStepEquipment } from "@/features/character/create-character/lib/equipment/use-step-equipment";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { BackgroundEquipmentPickerSection } from "@/features/character/create-character/ui/steps/equipment/background-equipment-picker-section";
import { ClassEquipmentPickerSection } from "@/features/character/create-character/ui/steps/equipment/class-equipment-picker-section";
import { EquipmentKitOverviewSection } from "@/features/character/create-character/ui/steps/equipment/equipment-kit-overview-section";
import { FieldError } from "@/shared/ui/field";

type StepEquipmentProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
  error?: string;
};

export function StepEquipment({
  control,
  setValue,
  error,
}: StepEquipmentProps) {
  const data = useStepEquipment(control, setValue);

  if (data.isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando equipamento…</p>
    );
  }

  if (data.isEmpty) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum pacote de equipamento inicial disponível no catálogo.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <FieldError errors={error ? [{ message: error }] : []} />
      <EquipmentKitOverviewSection data={data} />
      <ClassEquipmentPickerSection data={data} />
      <BackgroundEquipmentPickerSection data={data} />
    </div>
  );
}

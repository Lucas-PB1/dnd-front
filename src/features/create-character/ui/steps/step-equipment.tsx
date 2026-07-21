"use client";

import { useMemo } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { BackgroundEquipmentOption } from "@/entities/background/types";
import type { ClassEquipmentOption } from "@/entities/class/types";
import type { CharacterEquipment } from "@/entities/character/sheet-types";
import {
  useBackgroundDetail,
  useBackgroundEquipment,
} from "@/features/background-catalog/api/use-backgrounds";
import { useClassEquipment } from "@/features/class-catalog/api/use-classes";
import {
  BACKGROUND_GOLD_PACKAGE_SLUG,
  buildBackgroundEquipmentPayload,
  buildClassEquipmentPayload,
  formatBackgroundEquipmentLine,
  formatClassEquipmentLine,
  groupEquipmentPackages,
  type EquipmentPackage,
} from "@/features/create-character/lib/equipment-selection";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";
import { cn } from "@/shared/lib/utils";

type StepEquipmentProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
  error?: string;
};

function PackagePreviewList({
  lines,
}: {
  lines: string[];
}) {
  if (lines.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">Sem itens listados.</p>
    );
  }
  return (
    <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
      {lines.map((line, index) => (
        <li key={`${line}-${index}`}>{line}</li>
      ))}
    </ul>
  );
}

function classPackageLines(pkg: EquipmentPackage<ClassEquipmentOption>): string[] {
  return pkg.rows
    .map(formatClassEquipmentLine)
    .filter((line) => line !== "—");
}

function backgroundPackageLines(
  pkg: EquipmentPackage<BackgroundEquipmentOption>,
): string[] {
  const lines = pkg.rows
    .map(formatBackgroundEquipmentLine)
    .filter((line) => line !== "—");
  const extraGold = pkg.rows[0]?.packageGold;
  if (extraGold != null && extraGold > 0) {
    lines.push(`${extraGold} PO`);
  }
  return lines;
}

export function StepEquipment({
  control,
  setValue,
  error,
}: StepEquipmentProps) {
  const classSlug = useWatch({ control, name: "classSlug", defaultValue: "" });
  const backgroundSlug = useWatch({
    control,
    name: "backgroundSlug",
    defaultValue: "",
  });
  const equipment = useWatch({ control, name: "equipment", defaultValue: [] });

  const classEquipment = useClassEquipment(classSlug, !!classSlug);
  const backgroundEquipment = useBackgroundEquipment(
    backgroundSlug,
    !!backgroundSlug,
  );
  const backgroundDetail = useBackgroundDetail(backgroundSlug, !!backgroundSlug);

  const classPackages = useMemo(
    () => groupEquipmentPackages(classEquipment.data?.data ?? []),
    [classEquipment.data?.data],
  );
  const backgroundPackages = useMemo(
    () => groupEquipmentPackages(backgroundEquipment.data?.data ?? []),
    [backgroundEquipment.data?.data],
  );

  const backgroundGoldOption =
    backgroundDetail.data?.equipmentGoldOption ?? null;

  const selectedClassPkg = equipment.find(
    (e) => e.source === "class",
  )?.packageSlug;
  const selectedBgPkg = equipment.find(
    (e) => e.source === "background",
  )?.packageSlug;

  function applyEquipment(next: CharacterEquipment[]) {
    setValue("equipment", next);
  }

  function selectClassPackage(packageSlug: string) {
    const pkg = classPackages.find((p) => p.packageSlug === packageSlug);
    const classPart = pkg
      ? buildClassEquipmentPayload(packageSlug, pkg.rows)
      : [];
    const bgPart = equipment.filter((e) => e.source === "background");
    applyEquipment([...classPart, ...bgPart]);
  }

  function selectBackgroundPackage(packageSlug: string) {
    const classPart = equipment.filter((e) => e.source === "class");
    if (packageSlug === BACKGROUND_GOLD_PACKAGE_SLUG) {
      applyEquipment([
        ...classPart,
        ...buildBackgroundEquipmentPayload(BACKGROUND_GOLD_PACKAGE_SLUG, []),
      ]);
      return;
    }
    const pkg = backgroundPackages.find((p) => p.packageSlug === packageSlug);
    const bgPart = pkg
      ? buildBackgroundEquipmentPayload(packageSlug, pkg.rows)
      : [];
    applyEquipment([...classPart, ...bgPart]);
  }

  if (classEquipment.isPending || backgroundEquipment.isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando equipamento…</p>
    );
  }

  if (classPackages.length === 0 && backgroundPackages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum pacote de equipamento inicial disponível no catálogo.
      </p>
    );
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Equipamento inicial</FieldLabel>
        <FieldDescription>
          Escolha um pacote da classe e do antecedente. Os itens do pacote entram
          automaticamente na ficha — não é preciso marcar checkboxes.
        </FieldDescription>
        <FieldError errors={error ? [{ message: error }] : []} />
      </Field>

      {classPackages.length > 0 ? (
        <Field>
          <FieldLabel>Pacote da classe</FieldLabel>
          <div className="flex flex-col gap-3">
            {classPackages.map((pkg) => (
              <label
                key={pkg.packageSlug}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-lg border px-3 py-3 text-sm",
                  selectedClassPkg === pkg.packageSlug &&
                    "border-primary bg-primary/5",
                )}
              >
                <input
                  type="radio"
                  name="class-equipment-package"
                  className="mt-1 shrink-0"
                  checked={selectedClassPkg === pkg.packageSlug}
                  onChange={() => selectClassPackage(pkg.packageSlug)}
                />
                <div className="min-w-0 flex-1">
                  <span className="font-medium">Pacote {pkg.packageLabel}</span>
                  <PackagePreviewList lines={classPackageLines(pkg)} />
                </div>
              </label>
            ))}
          </div>
        </Field>
      ) : null}

      {backgroundPackages.length > 0 || backgroundGoldOption != null ? (
        <Field>
          <FieldLabel>Pacote do antecedente</FieldLabel>
          <div className="flex flex-col gap-3">
            {backgroundPackages.map((pkg) => (
              <label
                key={pkg.packageSlug}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-lg border px-3 py-3 text-sm",
                  selectedBgPkg === pkg.packageSlug &&
                    "border-primary bg-primary/5",
                )}
              >
                <input
                  type="radio"
                  name="background-equipment-package"
                  className="mt-1 shrink-0"
                  checked={selectedBgPkg === pkg.packageSlug}
                  onChange={() => selectBackgroundPackage(pkg.packageSlug)}
                />
                <div className="min-w-0 flex-1">
                  <span className="font-medium">
                    Pacote {pkg.packageLabel}
                  </span>
                  <PackagePreviewList lines={backgroundPackageLines(pkg)} />
                </div>
              </label>
            ))}

            {backgroundGoldOption != null ? (
              <label
                className={cn(
                  "flex cursor-pointer gap-3 rounded-lg border px-3 py-3 text-sm",
                  selectedBgPkg === BACKGROUND_GOLD_PACKAGE_SLUG &&
                    "border-primary bg-primary/5",
                )}
              >
                <input
                  type="radio"
                  name="background-equipment-package"
                  className="mt-1 shrink-0"
                  checked={selectedBgPkg === BACKGROUND_GOLD_PACKAGE_SLUG}
                  onChange={() =>
                    selectBackgroundPackage(BACKGROUND_GOLD_PACKAGE_SLUG)
                  }
                />
                <div className="min-w-0 flex-1">
                  <span className="font-medium">
                    {backgroundGoldOption} PO (em vez do pacote de itens)
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Opção do PHB: receber ouro no lugar do equipamento do
                    antecedente.
                  </p>
                </div>
              </label>
            ) : null}
          </div>
        </Field>
      ) : null}
    </FieldGroup>
  );
}

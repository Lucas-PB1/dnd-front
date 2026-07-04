"use client";

import { useMemo } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { CharacterEquipment } from "@/entities/character/sheet-types";
import { useBackgroundEquipment } from "@/features/background-catalog/api/use-backgrounds";
import { useClassEquipment } from "@/features/class-catalog/api/use-classes";
import {
  buildBackgroundEquipmentPayload,
  buildClassEquipmentPayload,
  getPackageItemChoices,
  groupEquipmentPackages,
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

  const classPackages = useMemo(
    () => groupEquipmentPackages(classEquipment.data?.data ?? []),
    [classEquipment.data?.data],
  );
  const backgroundPackages = useMemo(
    () => groupEquipmentPackages(backgroundEquipment.data?.data ?? []),
    [backgroundEquipment.data?.data],
  );

  const selectedClassPkg = equipment.find(
    (e) => e.source === "class",
  )?.packageSlug;
  const selectedBgPkg = equipment.find(
    (e) => e.source === "background",
  )?.packageSlug;

  const classItemSlugs = equipment
    .filter((e) => e.source === "class" && e.itemSlug)
    .map((e) => e.itemSlug!);
  const bgItemSlugs = equipment
    .filter((e) => e.source === "background" && e.itemSlug)
    .map((e) => e.itemSlug!);

  function syncEquipment(
    classPkg: string | undefined,
    classItems: string[],
    bgPkg: string | undefined,
    bgItems: string[],
  ) {
    const next: CharacterEquipment[] = [];
    if (classPkg) {
      const pkg = classPackages.find((p) => p.packageSlug === classPkg);
      next.push(
        ...buildClassEquipmentPayload(classPkg, pkg?.rows ?? [], classItems),
      );
    }
    if (bgPkg) {
      const pkg = backgroundPackages.find((p) => p.packageSlug === bgPkg);
      next.push(
        ...buildBackgroundEquipmentPayload(bgPkg, pkg?.rows ?? [], bgItems),
      );
    }
    setValue("equipment", next);
  }

  function toggleClassItem(slug: string) {
    const pkg = selectedClassPkg;
    if (!pkg) return;
    const next = classItemSlugs.includes(slug)
      ? classItemSlugs.filter((s) => s !== slug)
      : [...classItemSlugs, slug];
    syncEquipment(pkg, next, selectedBgPkg, bgItemSlugs);
  }

  function toggleBgItem(slug: string) {
    const pkg = selectedBgPkg;
    if (!pkg) return;
    const next = bgItemSlugs.includes(slug)
      ? bgItemSlugs.filter((s) => s !== slug)
      : [...bgItemSlugs, slug];
    syncEquipment(selectedClassPkg, classItemSlugs, pkg, next);
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

  const activeClassPkg = classPackages.find(
    (p) => p.packageSlug === selectedClassPkg,
  );
  const classChoices = activeClassPkg
    ? getPackageItemChoices(activeClassPkg)
    : [];

  const activeBgPkg = backgroundPackages.find(
    (p) => p.packageSlug === selectedBgPkg,
  );
  const bgChoices = activeBgPkg ? getPackageItemChoices(activeBgPkg) : [];

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Equipamento inicial</FieldLabel>
        <FieldDescription>
          Escolha os pacotes de classe e antecedente; marque itens quando houver
          opções.
        </FieldDescription>
        <FieldError errors={error ? [{ message: error }] : []} />
      </Field>

      {classPackages.length > 0 ? (
        <Field>
          <FieldLabel>Pacote da classe</FieldLabel>
          <div className="flex flex-col gap-2">
            {classPackages.map((pkg) => (
              <label
                key={pkg.packageSlug}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                  selectedClassPkg === pkg.packageSlug &&
                    "border-primary bg-primary/5",
                )}
              >
                <input
                  type="radio"
                  name="class-equipment-package"
                  checked={selectedClassPkg === pkg.packageSlug}
                  onChange={() =>
                    syncEquipment(
                      pkg.packageSlug,
                      [],
                      selectedBgPkg,
                      bgItemSlugs,
                    )
                  }
                />
                Pacote {pkg.packageLabel}
              </label>
            ))}
          </div>
          {classChoices.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2">
              {classChoices.map((row) =>
                row.itemSlug ? (
                  <li key={row.itemSlug}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={classItemSlugs.includes(row.itemSlug)}
                        onChange={() => toggleClassItem(row.itemSlug!)}
                      />
                      {row.itemName ?? row.itemSlug}
                      {row.choiceText ? (
                        <span className="text-muted-foreground">
                          — {row.choiceText}
                        </span>
                      ) : null}
                    </label>
                  </li>
                ) : null,
              )}
            </ul>
          ) : null}
        </Field>
      ) : null}

      {backgroundPackages.length > 0 ? (
        <Field>
          <FieldLabel>Pacote do antecedente</FieldLabel>
          <div className="flex flex-col gap-2">
            {backgroundPackages.map((pkg) => (
              <label
                key={pkg.packageSlug}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                  selectedBgPkg === pkg.packageSlug &&
                    "border-primary bg-primary/5",
                )}
              >
                <input
                  type="radio"
                  name="background-equipment-package"
                  checked={selectedBgPkg === pkg.packageSlug}
                  onChange={() =>
                    syncEquipment(
                      selectedClassPkg,
                      classItemSlugs,
                      pkg.packageSlug,
                      [],
                    )
                  }
                />
                Pacote {pkg.packageLabel}
                {pkg.rows[0]?.packageGold
                  ? ` (${pkg.rows[0].packageGold} PO)`
                  : null}
              </label>
            ))}
          </div>
          {bgChoices.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2">
              {bgChoices.map((row) =>
                row.itemSlug ? (
                  <li key={row.itemSlug}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={bgItemSlugs.includes(row.itemSlug)}
                        onChange={() => toggleBgItem(row.itemSlug!)}
                      />
                      {row.itemName ?? row.itemSlug}
                    </label>
                  </li>
                ) : null,
              )}
            </ul>
          ) : null}
        </Field>
      ) : null}
    </FieldGroup>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { CharacterEquipment } from "@/entities/character/sheet-types";
import {
  useBackgroundDetail,
  useBackgroundEquipment,
} from "@/features/background-catalog/api/use-backgrounds";
import {
  useClassDetail,
  useClassEquipment,
} from "@/features/class-catalog/api/use-classes";
import { choicePickKey } from "@/features/create-character/lib/equipment-choice-resolve";
import {
  BACKGROUND_GOLD_PACKAGE_SLUG,
  backgroundEquipmentLines,
  buildBackgroundEquipmentPayload,
  buildClassEquipmentPayload,
  classEquipmentLines,
  groupEquipmentPackages,
  isGoldOnlyClassPackage,
  pendingEquipmentChoices,
  type EquipmentLine,
  type EquipmentResolveContext,
} from "@/features/create-character/lib/equipment-selection";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import {
  ChoicePickers,
  PackageCard,
  SelectionStatus,
  SummaryBlock,
} from "@/features/create-character/ui/steps/equipment-package-ui";
import { WizardFormSection } from "@/features/create-character/ui/wizard-form-section";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";
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
  const classSlug = useWatch({ control, name: "classSlug", defaultValue: "" });
  const backgroundSlug = useWatch({
    control,
    name: "backgroundSlug",
    defaultValue: "",
  });
  const backgroundToolItemSlug = useWatch({
    control,
    name: "backgroundToolItemSlug",
    defaultValue: "",
  });
  const equipment = useWatch({ control, name: "equipment", defaultValue: [] });

  const [choicePicks, setChoicePicks] = useState<Record<string, string>>({});

  const classDetail = useClassDetail(classSlug, !!classSlug);
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

  const resolveCtx: EquipmentResolveContext = useMemo(
    () => ({
      backgroundToolItemSlug: backgroundToolItemSlug?.trim() || undefined,
      choicePicks,
    }),
    [backgroundToolItemSlug, choicePicks],
  );

  const backgroundGoldOption =
    backgroundDetail.data?.equipmentGoldOption ?? null;

  const selectedClassPkg = equipment.find(
    (e) => e.source === "class",
  )?.packageSlug;
  const selectedBgPkg = equipment.find(
    (e) => e.source === "background",
  )?.packageSlug;

  const selectedClassLines = useMemo(() => {
    if (!selectedClassPkg) return [];
    const pkg = classPackages.find((p) => p.packageSlug === selectedClassPkg);
    return pkg ? classEquipmentLines(pkg, resolveCtx) : [];
  }, [selectedClassPkg, classPackages, resolveCtx]);

  const selectedBgLines = useMemo(() => {
    if (!selectedBgPkg) return [];
    if (selectedBgPkg === BACKGROUND_GOLD_PACKAGE_SLUG) {
      return backgroundGoldOption != null
        ? ([
            {
              kind: "gold" as const,
              label: `${backgroundGoldOption} PO`,
            },
          ] satisfies EquipmentLine[])
        : [];
    }
    const pkg = backgroundPackages.find(
      (p) => p.packageSlug === selectedBgPkg,
    );
    return pkg ? backgroundEquipmentLines(pkg, resolveCtx) : [];
  }, [selectedBgPkg, backgroundPackages, backgroundGoldOption, resolveCtx]);

  const pendingClass = pendingEquipmentChoices(selectedClassLines);
  const pendingBg = pendingEquipmentChoices(selectedBgLines);

  // Espelha a ferramenta do antecedente no kit — só quando o slug muda de fato.
  const prevToolRef = useRef(backgroundToolItemSlug);
  useEffect(() => {
    const prev = prevToolRef.current;
    prevToolRef.current = backgroundToolItemSlug;
    if (prev === backgroundToolItemSlug) return;
    if (!selectedClassPkg && !selectedBgPkg) return;
    if (classPackages.length === 0 && backgroundPackages.length === 0) return;
    rebuildEquipment();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync pontual por ferramenta
  }, [backgroundToolItemSlug]);

  function applyEquipment(next: CharacterEquipment[]) {
    const same =
      next.length === equipment.length &&
      next.every((row, i) => {
        const cur = equipment[i];
        return (
          cur &&
          cur.source === row.source &&
          cur.packageSlug === row.packageSlug &&
          cur.itemSlug === row.itemSlug &&
          (cur.quantity ?? 1) === (row.quantity ?? 1)
        );
      });
    if (same) return;
    setValue("equipment", next, { shouldDirty: true });
  }

  function rebuildEquipment(overrides?: {
    classPkg?: string | null;
    bgPkg?: string | null;
    picks?: Record<string, string>;
  }) {
    const classPkg =
      overrides && "classPkg" in overrides
        ? (overrides.classPkg ?? undefined)
        : selectedClassPkg;
    const bgPkg =
      overrides && "bgPkg" in overrides
        ? (overrides.bgPkg ?? undefined)
        : selectedBgPkg;
    const picks = overrides?.picks ?? choicePicks;
    const ctx: EquipmentResolveContext = {
      backgroundToolItemSlug: backgroundToolItemSlug?.trim() || undefined,
      choicePicks: picks,
    };

    const classPart = (() => {
      if (!classPkg) return [];
      const pkg = classPackages.find((p) => p.packageSlug === classPkg);
      return pkg ? buildClassEquipmentPayload(classPkg, pkg.rows, ctx) : [];
    })();

    const bgPart = (() => {
      if (!bgPkg) return [];
      if (bgPkg === BACKGROUND_GOLD_PACKAGE_SLUG) {
        return buildBackgroundEquipmentPayload(
          BACKGROUND_GOLD_PACKAGE_SLUG,
          [],
          ctx,
        );
      }
      const pkg = backgroundPackages.find((p) => p.packageSlug === bgPkg);
      return pkg
        ? buildBackgroundEquipmentPayload(bgPkg, pkg.rows, ctx)
        : [];
    })();

    applyEquipment([...classPart, ...bgPart]);
  }

  function selectClassPackage(packageSlug: string) {
    rebuildEquipment({ classPkg: packageSlug });
  }

  function selectBackgroundPackage(packageSlug: string) {
    rebuildEquipment({ bgPkg: packageSlug });
  }

  function onChoicePick(
    source: "class" | "background",
    packageSlug: string,
    sortOrder: number,
    valueId: string,
  ) {
    const key = choicePickKey(source, packageSlug, sortOrder);
    const nextPicks = { ...choicePicks, [key]: valueId };
    setChoicePicks(nextPicks);
    rebuildEquipment({ picks: nextPicks });
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

  const className = classDetail.data?.name ?? "Classe";
  const backgroundName = backgroundDetail.data?.name ?? "Antecedente";
  const hasClassPick = Boolean(selectedClassPkg);
  const hasBgPick = Boolean(selectedBgPkg);
  const needsBg =
    backgroundPackages.length > 0 || backgroundGoldOption != null;

  return (
    <div className="space-y-3">
      <FieldError errors={error ? [{ message: error }] : []} />

      <WizardFormSection title="Kit inicial" compact>
        <p className="text-xs text-muted-foreground">
          Escolha um pacote de classe
          {needsBg ? " e um de antecedente" : ""}. Itens fixos do PHB já entram
          no kit; só aparece seletor quando há escolha real (instrumento, kit de
          jogos, etc.).
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          <SelectionStatus
            label={className}
            ready={hasClassPick}
            detail={
              hasClassPick
                ? `Pacote ${selectedClassPkg?.toUpperCase()}`
                : "Nenhum pacote"
            }
          />
          {needsBg ? (
            <SelectionStatus
              label={backgroundName}
              ready={hasBgPick}
              detail={
                !hasBgPick
                  ? "Nenhum pacote"
                  : selectedBgPkg === BACKGROUND_GOLD_PACKAGE_SLUG
                    ? `${backgroundGoldOption} PO`
                    : `Pacote ${selectedBgPkg?.toUpperCase()}`
              }
            />
          ) : null}
        </div>

        {(selectedClassLines.length > 0 || selectedBgLines.length > 0) && (
          <div className="space-y-2 rounded-lg border border-dashed border-border/80 bg-muted/15 p-3">
            <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
              Resumo da seleção
            </p>
            {selectedClassLines.length > 0 ? (
              <SummaryBlock
                title={`Classe · ${className}`}
                lines={selectedClassLines}
              />
            ) : null}
            {selectedBgLines.length > 0 ? (
              <SummaryBlock
                title={`Antecedente · ${backgroundName}`}
                lines={selectedBgLines}
              />
            ) : null}
          </div>
        )}
      </WizardFormSection>

      {classPackages.length > 0 ? (
        <WizardFormSection title={`Classe · ${className}`} compact>
          <div className={cn("grid gap-2 sm:grid-cols-2", motion.stagger)}>
            {classPackages.map((pkg) => {
              const lines = classEquipmentLines(pkg, resolveCtx);
              const goldOnly = isGoldOnlyClassPackage(pkg);
              const selected = selectedClassPkg === pkg.packageSlug;
              return (
                <PackageCard
                  key={pkg.packageSlug}
                  name="class-equipment-package"
                  selected={selected}
                  title={`Pacote ${pkg.packageLabel}`}
                  badge={goldOnly ? "Só ouro" : "Itens"}
                  badgeTone={goldOnly ? "gold" : "default"}
                  lines={lines}
                  onSelect={() => selectClassPackage(pkg.packageSlug)}
                />
              );
            })}
          </div>
          {pendingClass.length > 0 && selectedClassPkg ? (
            <ChoicePickers
              source="class"
              packageSlug={selectedClassPkg}
              lines={pendingClass}
              choicePicks={choicePicks}
              onPick={onChoicePick}
            />
          ) : null}
        </WizardFormSection>
      ) : null}

      {needsBg ? (
        <WizardFormSection title={`Antecedente · ${backgroundName}`} compact>
          <div className={cn("grid gap-2 sm:grid-cols-2", motion.stagger)}>
            {backgroundPackages.map((pkg) => (
              <PackageCard
                key={pkg.packageSlug}
                name="background-equipment-package"
                selected={selectedBgPkg === pkg.packageSlug}
                title={`Pacote ${pkg.packageLabel}`}
                badge="Itens"
                badgeTone="default"
                lines={backgroundEquipmentLines(pkg, resolveCtx)}
                onSelect={() => selectBackgroundPackage(pkg.packageSlug)}
              />
            ))}

            {backgroundGoldOption != null ? (
              <PackageCard
                name="background-equipment-package"
                selected={selectedBgPkg === BACKGROUND_GOLD_PACKAGE_SLUG}
                title={`${backgroundGoldOption} PO`}
                badge="Só ouro"
                badgeTone="gold"
                lines={[
                  {
                    kind: "text",
                    label: "Em vez do pacote de itens",
                  },
                ]}
                onSelect={() =>
                  selectBackgroundPackage(BACKGROUND_GOLD_PACKAGE_SLUG)
                }
              />
            ) : null}
          </div>
          {pendingBg.length > 0 &&
          selectedBgPkg &&
          selectedBgPkg !== BACKGROUND_GOLD_PACKAGE_SLUG ? (
            <ChoicePickers
              source="background"
              packageSlug={selectedBgPkg}
              lines={pendingBg}
              choicePicks={choicePicks}
              backgroundToolItemSlug={backgroundToolItemSlug}
              onPick={onChoicePick}
            />
          ) : null}
        </WizardFormSection>
      ) : null}
    </div>
  );
}

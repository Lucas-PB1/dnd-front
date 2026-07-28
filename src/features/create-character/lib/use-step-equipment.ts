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
  pendingEquipmentChoices,
  type EquipmentLine,
  type EquipmentResolveContext,
} from "@/features/create-character/lib/equipment-selection";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";

export function useStepEquipment(
  control: Control<CreateCharacterInput>,
  setValue: UseFormSetValue<CreateCharacterInput>,
) {
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

  const className = classDetail.data?.name ?? "Classe";
  const backgroundName = backgroundDetail.data?.name ?? "Antecedente";
  const hasClassPick = Boolean(selectedClassPkg);
  const hasBgPick = Boolean(selectedBgPkg);
  const needsBg =
    backgroundPackages.length > 0 || backgroundGoldOption != null;

  return {
    isPending: classEquipment.isPending || backgroundEquipment.isPending,
    isEmpty: classPackages.length === 0 && backgroundPackages.length === 0,
    className,
    backgroundName,
    classPackages,
    backgroundPackages,
    resolveCtx,
    backgroundGoldOption,
    selectedClassPkg,
    selectedBgPkg,
    selectedClassLines,
    selectedBgLines,
    pendingClass,
    pendingBg,
    choicePicks,
    backgroundToolItemSlug,
    hasClassPick,
    hasBgPick,
    needsBg,
    selectClassPackage,
    selectBackgroundPackage,
    onChoicePick,
  };
}

export type StepEquipmentData = ReturnType<typeof useStepEquipment>;

"use client";

import { useMemo } from "react";

import {
  useBackgroundDetail,
  useBackgroundEquipment,
} from "@/features/background-catalog/api/use-backgrounds";
import {
  useClassDetail,
  useClassEquipment,
} from "@/features/class-catalog/api/use-classes";
import { toolNameForSlug } from "@/features/create-character/lib/equipment/equipment-choice-resolve";
import {
  BACKGROUND_GOLD_PACKAGE_SLUG,
  backgroundEquipmentLines,
  classEquipmentLines,
  groupEquipmentPackages,
} from "@/features/create-character/lib/equipment/equipment-selection";
import type { SheetReadSectionProps } from "@/features/character-sheet/ui/sections/sheet-section-types";
import { SheetChip } from "@/features/character-sheet/ui/sheet/sheet-ui";

export function EquipmentSection({
  character,
}: Pick<SheetReadSectionProps, "character">) {
  const classEquipment = useClassEquipment(character.classSlug, true);
  const backgroundEquipment = useBackgroundEquipment(
    character.backgroundSlug,
    true,
  );
  const classDetail = useClassDetail(character.classSlug, true);
  const backgroundDetail = useBackgroundDetail(character.backgroundSlug, true);

  const classPackages = useMemo(
    () => groupEquipmentPackages(classEquipment.data?.data ?? []),
    [classEquipment.data?.data],
  );
  const backgroundPackages = useMemo(
    () => groupEquipmentPackages(backgroundEquipment.data?.data ?? []),
    [backgroundEquipment.data?.data],
  );

  if (character.equipment.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum equipamento inicial registrado.
      </p>
    );
  }

  if (classEquipment.isPending || backgroundEquipment.isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando equipamento…</p>
    );
  }

  const classRows = classEquipment.data?.data ?? [];
  const backgroundRows = backgroundEquipment.data?.data ?? [];
  const resolveCtx = {
    backgroundToolItemSlug: character.backgroundToolItemSlug ?? undefined,
  };

  const bySource = {
    class: character.equipment.filter((e) => e.source === "class"),
    background: character.equipment.filter((e) => e.source === "background"),
  };

  function resolveItemName(
    source: "class" | "background",
    packageSlug: string,
    itemSlug?: string,
  ) {
    if (!itemSlug) return null;
    const rows = source === "class" ? classRows : backgroundRows;
    const row = rows.find(
      (r) => r.packageSlug === packageSlug && r.itemSlug === itemSlug,
    );
    return row?.itemName ?? toolNameForSlug(itemSlug) ?? itemSlug;
  }

  function resolvePackageLabel(
    source: "class" | "background",
    packageSlug: string,
  ) {
    if (
      source === "background" &&
      packageSlug === BACKGROUND_GOLD_PACKAGE_SLUG
    ) {
      const gold = backgroundDetail.data?.equipmentGoldOption;
      return gold != null ? `${gold} PO` : "Ouro";
    }
    const packages = source === "class" ? classPackages : backgroundPackages;
    const pkg = packages.find((p) => p.packageSlug === packageSlug);
    return pkg?.packageLabel ?? packageSlug;
  }

  function linesForSource(source: "class" | "background") {
    const items = bySource[source];
    if (items.length === 0) return null;

    const packageSlug = items[0]?.packageSlug ?? "";
    const storedItems = items.filter((e) => e.itemSlug);
    const classPkg =
      source === "class"
        ? classPackages.find((p) => p.packageSlug === packageSlug)
        : undefined;
    const backgroundPkg =
      source === "background"
        ? backgroundPackages.find((p) => p.packageSlug === packageSlug)
        : undefined;

    const catalogLines = classPkg
      ? classEquipmentLines(classPkg, resolveCtx)
      : backgroundPkg
        ? backgroundEquipmentLines(backgroundPkg, resolveCtx)
        : [];

    // Catálogo do pacote é a fonte de verdade na leitura (marcadores TEMP
    // e choice_text resolvem aqui). Persistidos cobrem fallback sem catálogo.
    const displayLines =
      catalogLines.length > 0
        ? catalogLines.map((line, index) => ({
            key: `${line.kind}-${line.itemSlug ?? line.label}-${index}`,
            label: line.label,
            quantity: line.quantity,
            kind: line.kind,
          }))
        : storedItems.map((item) => ({
            key: `${item.itemSlug}-${item.sortOrder ?? 0}`,
            label:
              resolveItemName(source, item.packageSlug, item.itemSlug) ??
              item.itemSlug!,
            quantity: item.quantity,
            kind: "item" as const,
          }));

    return {
      packageSlug,
      displayLines,
      sourceLabel:
        source === "class"
          ? (classDetail.data?.name ?? "Classe")
          : (backgroundDetail.data?.name ?? "Antecedente"),
    };
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(["class", "background"] as const).map((source) => {
        const block = linesForSource(source);
        if (!block) return null;

        return (
          <div
            key={source}
            className="space-y-2 rounded-xl border border-border/70 bg-background/40 p-3"
          >
            <div>
              <p className="text-sm font-medium">{block.sourceLabel}</p>
              <p className="text-xs text-muted-foreground">
                Pacote {resolvePackageLabel(source, block.packageSlug)}
              </p>
            </div>
            {block.displayLines.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {block.displayLines.map((line) => (
                  <li key={line.key}>
                    <SheetChip
                      hint={
                        line.kind === "gold"
                          ? "ouro"
                          : line.kind === "text" || line.kind === "pick-tool"
                            ? "escolha"
                            : line.kind === "mirror-tool"
                              ? "ferramenta"
                              : undefined
                      }
                    >
                      {line.quantity && line.quantity > 1
                        ? `${line.quantity}× `
                        : null}
                      {line.label}
                    </SheetChip>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">
                Sem itens catalogados neste pacote.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { BACKGROUND_GOLD_PACKAGE_SLUG } from "@/features/character/create-character/lib/equipment/equipment-selection";
import type { StepEquipmentData } from "@/features/character/create-character/lib/equipment/use-step-equipment";
import {
  SelectionStatus,
  SummaryBlock,
} from "@/features/character/create-character/ui/steps/equipment/equipment-package-ui";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";

export function EquipmentKitOverviewSection({
  data,
}: {
  data: StepEquipmentData;
}) {
  const {
    className,
    backgroundName,
    needsBg,
    hasClassPick,
    hasBgPick,
    selectedClassPkg,
    selectedBgPkg,
    backgroundGoldOption,
    selectedClassLines,
    selectedBgLines,
  } = data;

  return (
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
  );
}

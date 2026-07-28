"use client";

import {
  BACKGROUND_GOLD_PACKAGE_SLUG,
  backgroundEquipmentLines,
} from "@/features/character/create-character/lib/equipment/equipment-selection";
import type { StepEquipmentData } from "@/features/character/create-character/lib/equipment/use-step-equipment";
import {
  ChoicePickers,
  PackageCard,
} from "@/features/character/create-character/ui/steps/equipment/equipment-package-ui";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

export function BackgroundEquipmentPickerSection({
  data,
}: {
  data: StepEquipmentData;
}) {
  const {
    backgroundName,
    backgroundPackages,
    backgroundGoldOption,
    resolveCtx,
    selectedBgPkg,
    pendingBg,
    choicePicks,
    backgroundToolItemSlug,
    needsBg,
    selectBackgroundPackage,
    onChoicePick,
  } = data;

  if (!needsBg) return null;

  return (
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
  );
}

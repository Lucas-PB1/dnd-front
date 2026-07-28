"use client";

import {
  classEquipmentLines,
  isGoldOnlyClassPackage,
} from "@/features/create-character/lib/equipment-selection";
import type { StepEquipmentData } from "@/features/create-character/lib/use-step-equipment";
import {
  ChoicePickers,
  PackageCard,
} from "@/features/create-character/ui/steps/equipment-package-ui";
import { WizardFormSection } from "@/features/create-character/ui/wizard-form-section";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

export function ClassEquipmentPickerSection({
  data,
}: {
  data: StepEquipmentData;
}) {
  const {
    className,
    classPackages,
    resolveCtx,
    selectedClassPkg,
    pendingClass,
    choicePicks,
    selectClassPackage,
    onChoicePick,
  } = data;

  if (classPackages.length === 0) return null;

  return (
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
  );
}

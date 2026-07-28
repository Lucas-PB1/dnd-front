import type { ComponentType, ReactNode, SVGProps } from "react";

import { SheetSectionHeader } from "@/features/character-sheet/ui/sheet/sheet-ui";

type CharacterSheetTabSectionProps = {
  title: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  action?: ReactNode;
  children: ReactNode;
};

export function CharacterSheetTabSection({
  title,
  icon,
  action,
  children,
}: CharacterSheetTabSectionProps) {
  return (
    <div className="space-y-3">
      <SheetSectionHeader title={title} icon={icon} action={action} />
      {children}
    </div>
  );
}

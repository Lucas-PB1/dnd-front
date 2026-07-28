"use client";

import type { SubclassSpellOption } from "@/entities/class/types";
import { PreviewButton } from "@/features/character/create-character/ui/steps/spells/spell-pick-rows";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";
import { cn } from "@/shared/lib/utils";

type SubclassSpellsSectionProps = {
  spells: SubclassSpellOption[];
  selectedSlugs: Set<string>;
  onToggle: (slug: string) => void;
  onPreview: (slug: string) => void;
};

export function SubclassSpellsSection({
  spells,
  selectedSlugs,
  onToggle,
  onPreview,
}: SubclassSpellsSectionProps) {
  if (spells.length === 0) return null;

  return (
    <WizardFormSection title="Subclasse" compact>
      <ul className="grid gap-2 sm:grid-cols-2">
        {spells.map((spell) => (
          <li key={spell.slug} className="list-none">
            <div
              className={cn(
                "flex items-start gap-2 rounded-lg border px-2.5 py-2 text-sm",
                selectedSlugs.has(spell.slug) && "border-primary bg-primary/5",
              )}
            >
              <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selectedSlugs.has(spell.slug)}
                  onChange={() => onToggle(spell.slug)}
                />
                <span>
                  {spell.name}
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Desbloqueio nv. {spell.unlockLevel}
                  </span>
                </span>
              </label>
              <PreviewButton onClick={() => onPreview(spell.slug)} />
            </div>
          </li>
        ))}
      </ul>
    </WizardFormSection>
  );
}

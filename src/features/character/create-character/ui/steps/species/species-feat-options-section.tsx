"use client";

import { featInstanceKey } from "@/entities/character/lib/character-feat";
import type { CharacterFeat, FeatOption } from "@/entities/character/sheet-types";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";
import { FeatOptionsEditor } from "@/features/catalog/feat-catalog/ui/options/feat-options-editor";

type SpeciesFeatOptionsSectionProps = {
  previewFeats: CharacterFeat[];
  humanOriginFeatKeys: Set<string>;
  featNameBySlug: Record<string, string>;
  featOptions: FeatOption[];
  level: number;
  classSlug: string;
  grantedSkillSlugs: string[];
  grantedToolSlugs: string[];
  onChange: (next: FeatOption[]) => void;
};

export function SpeciesFeatOptionsSection({
  previewFeats,
  humanOriginFeatKeys,
  featNameBySlug,
  featOptions,
  level,
  classSlug,
  grantedSkillSlugs,
  grantedToolSlugs,
  onChange,
}: SpeciesFeatOptionsSectionProps) {
  if (humanOriginFeatKeys.size === 0 || previewFeats.length === 0) {
    return null;
  }

  return (
    <WizardFormSection title="Opções do talento" compact>
      <FeatOptionsEditor
        characterFeats={previewFeats.filter((feat) =>
          humanOriginFeatKeys.has(
            featInstanceKey(feat.featSlug, feat.instanceIndex),
          ),
        )}
        featNameBySlug={featNameBySlug}
        value={featOptions}
        characterLevel={level}
        classSlug={classSlug}
        grantedSkillSlugs={grantedSkillSlugs}
        grantedToolSlugs={grantedToolSlugs}
        onChange={onChange}
      />
    </WizardFormSection>
  );
}

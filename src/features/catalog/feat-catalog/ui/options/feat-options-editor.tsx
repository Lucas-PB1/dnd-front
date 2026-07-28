"use client";

import type { CharacterFeat, FeatOption } from "@/entities/character/sheet-types";
import { formatCharacterFeatLabel } from "@/entities/character/lib/character-feat";
import { FeatOptionFields } from "@/features/catalog/feat-catalog/ui/options/feat-option-fields";

export function FeatOptionsEditor({
  characterFeats,
  featNameBySlug,
  value,
  onChange,
  characterLevel = 1,
  classSlug = "",
  grantedSkillSlugs = [],
  grantedToolSlugs = [],
}: {
  characterFeats: CharacterFeat[];
  featNameBySlug?: Record<string, string>;
  value: FeatOption[];
  onChange: (next: FeatOption[]) => void;
  characterLevel?: number;
  classSlug?: string;
  grantedSkillSlugs?: string[];
  grantedToolSlugs?: string[];
}) {
  if (characterFeats.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum talento com escolhas internas.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {characterFeats.map((feat) => (
        <div
          key={`${feat.featSlug}-${feat.instanceIndex}`}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold">
            {formatCharacterFeatLabel(
              feat,
              featNameBySlug ?? {},
              characterFeats,
            )}
          </h3>
          <FeatOptionFields
            feat={feat}
            value={value}
            onChange={onChange}
            characterLevel={characterLevel}
            classSlug={classSlug}
            grantedSkillSlugs={grantedSkillSlugs}
            grantedToolSlugs={grantedToolSlugs}
          />
        </div>
      ))}
    </div>
  );
}

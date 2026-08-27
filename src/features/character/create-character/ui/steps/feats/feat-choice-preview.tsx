"use client";

import type { FeatSummary } from "@/entities/feat/types";
import {
  ChoicePreviewPanel,
  formatFeatBenefitsTeaser,
} from "@/features/character/create-character/ui/choice-preview-panel";

type FeatChoicePreviewProps = {
  feat: FeatSummary | undefined;
  loading?: boolean;
  subtitle?: string;
};

/** Prévia mecânica do talento selecionado no wizard. */
export function FeatChoicePreview({
  feat,
  loading = false,
  subtitle = "Talento",
}: FeatChoicePreviewProps) {
  if (loading) {
    return <ChoicePreviewPanel title="Talento" loading />;
  }
  if (!feat) return null;

  const { teaser, detail } = formatFeatBenefitsTeaser(feat.benefits ?? []);
  const prerequisite = feat.prerequisite?.trim();
  const detailParts = [
    prerequisite ? `Pré-requisito: ${prerequisite}` : "",
    detail,
  ].filter(Boolean);

  return (
    <ChoicePreviewPanel
      title={feat.name}
      subtitle={subtitle}
      teaser={teaser || prerequisite || undefined}
      detailText={detailParts.join("\n\n") || undefined}
    />
  );
}

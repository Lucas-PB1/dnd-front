"use client";

import type { LevelUpPreview } from "@/entities/character/session-types";

type LevelUpPreviewSummaryProps = Pick<
  LevelUpPreview,
  | "currentLevel"
  | "nextLevel"
  | "currentProficiencyBonus"
  | "nextProficiencyBonus"
  | "estimatedHpGain"
  | "estimatedHitPointsMax"
  | "isAsiOrFeatLevel"
>;

export function LevelUpPreviewSummary({
  currentLevel,
  nextLevel,
  currentProficiencyBonus,
  nextProficiencyBonus,
  estimatedHpGain,
  estimatedHitPointsMax,
  isAsiOrFeatLevel,
}: LevelUpPreviewSummaryProps) {
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      <div>
        <dt className="text-muted-foreground">Nível atual → próximo</dt>
        <dd className="font-medium">
          {currentLevel} → {nextLevel}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Bônus de proficiência</dt>
        <dd className="font-medium">
          +{currentProficiencyBonus} → +{nextProficiencyBonus}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">PV estimados (máx)</dt>
        <dd className="font-medium">
          +{estimatedHpGain} → {estimatedHitPointsMax}
        </dd>
      </div>
      {isAsiOrFeatLevel ? (
        <div>
          <dt className="text-muted-foreground">Marco</dt>
          <dd className="font-medium">Nível de ASI / talento</dd>
        </div>
      ) : null}
    </dl>
  );
}

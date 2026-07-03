import {
  ABILITIES,
  ABILITY_ABBREV,
  ABILITY_LABELS,
} from "@/entities/character-sheet/constants";
import {
  displayReviewValue,
  ReviewBlock,
  type ReviewSectionProps,
} from "@/features/character-sheet/ui/review/review-primitives";

export function ReviewAbilitiesSection({ sheet }: ReviewSectionProps) {
  return (
    <ReviewBlock title="Atributos">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ABILITIES.map((ability) => (
          <div
            key={ability}
            className="rounded-lg border border-border bg-muted/20 p-3 text-center"
          >
            <p className="text-xs font-semibold uppercase">
              {ABILITY_ABBREV[ability]}
            </p>
            <p className="text-lg font-semibold">
              {displayReviewValue(sheet.abilities[ability].score)}
            </p>
            <p className="text-sm text-muted-foreground">
              {displayReviewValue(sheet.abilities[ability].modifier)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {ABILITY_LABELS[ability]}
            </p>
          </div>
        ))}
      </div>
    </ReviewBlock>
  );
}

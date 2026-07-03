import {
  findSubclassName,
  formatCharacterClassLevel,
} from "@/entities/character-sheet/classes";
import {
  findAlignmentName,
  findBackgroundName,
  findSpeciesName,
} from "@/entities/character-sheet/origins";
import {
  displayReviewValue,
  ReviewBlock,
  ReviewField,
  type ReviewSectionProps,
} from "@/features/character-sheet/ui/review/review-primitives";

export function ReviewIdentitySection({ sheet }: ReviewSectionProps) {
  return (
    <ReviewBlock title="Identidade">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ReviewField
          label="Nome"
          value={displayReviewValue(sheet.characterName)}
        />
        <ReviewField
          label="Espécie"
          value={displayReviewValue(findSpeciesName(sheet.species))}
        />
        <ReviewField
          label="Antecedente"
          value={displayReviewValue(findBackgroundName(sheet.background))}
        />
        <ReviewField
          label="Alinhamento"
          value={displayReviewValue(findAlignmentName(sheet.alignment))}
        />
        <ReviewField
          label="Classe & Nível"
          value={displayReviewValue(
            formatCharacterClassLevel(
              sheet.characterClass,
              sheet.characterLevel,
            ),
          )}
        />
        <ReviewField
          label="Subclasse"
          value={displayReviewValue(
            findSubclassName(sheet.characterClass, sheet.subclass),
          )}
        />
      </div>
    </ReviewBlock>
  );
}

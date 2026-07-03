import type { CharacterSheet } from "@/features/character-sheet/model/character-sheet.schema";
import { Button } from "@/shared/ui/button";
import { ReviewAbilitiesSection } from "@/features/character-sheet/ui/review/review-abilities-section";
import {
  ReviewCombatSection,
  ReviewSkillsSection,
} from "@/features/character-sheet/ui/review/review-combat-skills-section";
import {
  ReviewEquipmentSection,
  ReviewFeaturesSection,
  ReviewMagicItemsSection,
  ReviewSpellsSection,
  ReviewWeaponsSection,
} from "@/features/character-sheet/ui/review/review-features-section";
import { ReviewIdentitySection } from "@/features/character-sheet/ui/review/review-identity-section";

type CharacterSheetReviewProps = {
  sheet: CharacterSheet;
  finalized: boolean;
  onFinalize: () => void;
  onEdit: () => void;
};

export function CharacterSheetReview({
  sheet,
  finalized,
  onFinalize,
  onEdit,
}: CharacterSheetReviewProps) {
  return (
    <div className="flex flex-col gap-4">
      {finalized ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          Ficha finalizada localmente. Persistência no banco virá em uma próxima
          etapa.
        </div>
      ) : null}

      <ReviewIdentitySection sheet={sheet} />
      <ReviewAbilitiesSection sheet={sheet} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ReviewCombatSection sheet={sheet} />
        <ReviewSkillsSection sheet={sheet} />
      </div>

      <ReviewFeaturesSection sheet={sheet} />
      <ReviewWeaponsSection sheet={sheet} />
      <ReviewSpellsSection sheet={sheet} />
      <ReviewEquipmentSection sheet={sheet} />
      <ReviewMagicItemsSection sheet={sheet} />

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onEdit}>
          Voltar para editar
        </Button>
        {!finalized ? (
          <Button type="button" onClick={onFinalize}>
            Finalizar personagem
          </Button>
        ) : null}
      </div>
    </div>
  );
}

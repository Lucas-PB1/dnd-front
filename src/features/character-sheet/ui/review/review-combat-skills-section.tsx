import { SKILL_DEFINITIONS } from "@/entities/character-sheet/constants";
import {
  displayReviewValue,
  ReviewBlock,
  ReviewField,
  type ReviewSectionProps,
} from "@/features/character-sheet/ui/review/review-primitives";

export function ReviewCombatSection({ sheet }: ReviewSectionProps) {
  return (
    <ReviewBlock title="Combate">
      <div className="grid grid-cols-2 gap-3">
        <ReviewField label="CA" value={displayReviewValue(sheet.armorClass)} />
        <ReviewField
          label="Iniciativa"
          value={displayReviewValue(sheet.initiative)}
        />
        <ReviewField
          label="Velocidade"
          value={displayReviewValue(sheet.speed)}
        />
        <ReviewField
          label="PV máx."
          value={displayReviewValue(sheet.hitPointsMax)}
        />
        <ReviewField
          label="PV atual"
          value={displayReviewValue(sheet.hitPointsCurrent)}
        />
        <ReviewField
          label="Bônus de proficiência"
          value={displayReviewValue(sheet.proficiencyBonus)}
        />
      </div>
    </ReviewBlock>
  );
}

export function ReviewSkillsSection({ sheet }: ReviewSectionProps) {
  const proficientSkills = SKILL_DEFINITIONS.filter(
    (skill) =>
      sheet.skills[skill.key].proficient ||
      sheet.skills[skill.key].modifier.trim(),
  );

  return (
    <ReviewBlock title="Perícias marcadas">
      {proficientSkills.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma perícia preenchida.
        </p>
      ) : (
        <ul className="flex flex-col gap-1 text-sm">
          {proficientSkills.map((skill) => (
            <li key={skill.key}>
              {skill.label}
              {sheet.skills[skill.key].modifier.trim()
                ? ` (${sheet.skills[skill.key].modifier})`
                : ""}
            </li>
          ))}
        </ul>
      )}
    </ReviewBlock>
  );
}

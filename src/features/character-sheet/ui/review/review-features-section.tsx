import type { CharacterSheet } from "@/features/character-sheet/model/character-sheet.schema";
import { SPELL_SLOT_LEVELS } from "@/entities/character-sheet/constants";
import {
  displayReviewValue,
  ReviewBlock,
  ReviewField,
  ReviewText,
  type ReviewSectionProps,
} from "@/features/character-sheet/ui/review/review-primitives";

export function ReviewFeaturesSection({ sheet }: ReviewSectionProps) {
  return (
    <ReviewBlock title="Talentos & traços">
      <ReviewText label="Traços da espécie" value={sheet.speciesTraits} />
      <ReviewText label="Class features" value={sheet.classFeatures} />
      <ReviewText label="Feats" value={sheet.feats} />
      <ReviewText label="Cantrips" value={sheet.cantrips} />
    </ReviewBlock>
  );
}

export function ReviewWeaponsSection({ sheet }: ReviewSectionProps) {
  const filledWeapons = sheet.weapons.filter((weapon) => weapon.name.trim());

  if (filledWeapons.length === 0) {
    return null;
  }

  return (
    <ReviewBlock title="Armas">
      <ul className="flex flex-col gap-2 text-sm">
        {filledWeapons.map((weapon, index) => (
          <li key={index}>
            <span className="font-medium">{weapon.name}</span>
            {weapon.atkBonus.trim() ? ` · ${weapon.atkBonus}` : ""}
            {weapon.damage.trim() ? ` · ${weapon.damage}` : ""}
          </li>
        ))}
      </ul>
    </ReviewBlock>
  );
}

export function ReviewSpellsSection({ sheet }: ReviewSectionProps) {
  const filledSpells = sheet.spells.filter((spell) => spell.name.trim());

  if (!sheet.spellcastingAbility.trim() && filledSpells.length === 0) {
    return null;
  }

  return (
    <ReviewBlock title="Magia">
      <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ReviewField
          label="Atributo"
          value={displayReviewValue(sheet.spellcastingAbility)}
        />
        <ReviewField label="CD" value={displayReviewValue(sheet.spellSaveDc)} />
        <ReviewField
          label="Ataque"
          value={displayReviewValue(sheet.spellAttackBonus)}
        />
      </div>
      {filledSpells.length > 0 ? (
        <ul className="flex flex-col gap-1 text-sm">
          {filledSpells.map((spell, index) => (
            <li key={index}>
              {spell.name}
              {spell.level.trim() ? ` (nível ${spell.level})` : ""}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {SPELL_SLOT_LEVELS.map((level) => {
          const slot =
            sheet.spellSlots[
              String(level) as keyof CharacterSheet["spellSlots"]
            ];
          if (!slot.total.trim() && !slot.expended.trim()) {
            return null;
          }
          return (
            <span
              key={level}
              className="rounded-md border border-border px-2 py-1 text-xs"
            >
              Slot {level}: {displayReviewValue(slot.total)} / gastos{" "}
              {displayReviewValue(slot.expended)}
            </span>
          );
        })}
      </div>
    </ReviewBlock>
  );
}

export function ReviewEquipmentSection({ sheet }: ReviewSectionProps) {
  return (
    <ReviewBlock title="Equipamento & história">
      <ReviewText label="Equipamento" value={sheet.equipment} />
      <ReviewText label="Aparência" value={sheet.appearance} />
      <ReviewText label="Backstory" value={sheet.backstory} />
      <ReviewText label="Idiomas" value={sheet.languages} />
      {(sheet.coinsCp || sheet.coinsSp || sheet.coinsGp || sheet.coinsPp) && (
        <ReviewField
          label="Moedas"
          value={`CP ${displayReviewValue(sheet.coinsCp)} · SP ${displayReviewValue(sheet.coinsSp)} · GP ${displayReviewValue(sheet.coinsGp)} · PP ${displayReviewValue(sheet.coinsPp)}`}
        />
      )}
    </ReviewBlock>
  );
}

export function ReviewMagicItemsSection({ sheet }: ReviewSectionProps) {
  const filledMagicItems = sheet.magicItems.filter((item) => item.name.trim());

  if (filledMagicItems.length === 0) {
    return null;
  }

  return (
    <ReviewBlock title="Itens mágicos">
      <ul className="flex flex-col gap-1 text-sm">
        {filledMagicItems.map((item, index) => (
          <li key={index}>
            {item.name}
            {item.attuned ? " (sintonizado)" : ""}
          </li>
        ))}
      </ul>
    </ReviewBlock>
  );
}

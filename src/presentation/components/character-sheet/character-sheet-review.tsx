import type { CharacterSheet } from "@/application/character-sheet/character-sheet.schema";
import {
  findSubclassName,
  formatCharacterClassLevel,
} from "@/domain/character-sheet/classes";
import {
  ABILITIES,
  ABILITY_ABBREV,
  ABILITY_LABELS,
  SKILL_DEFINITIONS,
  SPELL_SLOT_LEVELS,
} from "@/domain/character-sheet/constants";
import { Button } from "@/components/ui/button";

function display(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  );
}

function ReviewBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 border-b border-border pb-2 text-xs font-semibold uppercase tracking-widest text-primary">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ReviewText({ label, value }: { label: string; value: string }) {
  const text = display(value);
  if (text === "—") {
    return null;
  }

  return (
    <div className="mb-3 last:mb-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm">{text}</p>
    </div>
  );
}

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
  const filledWeapons = sheet.weapons.filter((weapon) => weapon.name.trim());
  const filledSpells = sheet.spells.filter((spell) => spell.name.trim());
  const filledMagicItems = sheet.magicItems.filter((item) => item.name.trim());
  const proficientSkills = SKILL_DEFINITIONS.filter(
    (skill) =>
      sheet.skills[skill.key].proficient ||
      sheet.skills[skill.key].modifier.trim(),
  );

  return (
    <div className="flex flex-col gap-4">
      {finalized ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          Ficha finalizada localmente. Persistência no banco virá em uma próxima
          etapa.
        </div>
      ) : null}

      <ReviewBlock title="Identidade">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ReviewField label="Nome" value={display(sheet.characterName)} />
          <ReviewField label="Espécie" value={display(sheet.species)} />
          <ReviewField label="Antecedente" value={display(sheet.background)} />
          <ReviewField label="Alinhamento" value={display(sheet.alignment)} />
          <ReviewField
            label="Classe & Nível"
            value={display(
              formatCharacterClassLevel(
                sheet.characterClass,
                sheet.characterLevel,
              ),
            )}
          />
          <ReviewField
            label="Subclasse"
            value={display(
              findSubclassName(sheet.characterClass, sheet.subclass),
            )}
          />
        </div>
      </ReviewBlock>

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
                {display(sheet.abilities[ability].score)}
              </p>
              <p className="text-sm text-muted-foreground">
                {display(sheet.abilities[ability].modifier)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {ABILITY_LABELS[ability]}
              </p>
            </div>
          ))}
        </div>
      </ReviewBlock>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReviewBlock title="Combate">
          <div className="grid grid-cols-2 gap-3">
            <ReviewField label="CA" value={display(sheet.armorClass)} />
            <ReviewField label="Iniciativa" value={display(sheet.initiative)} />
            <ReviewField label="Velocidade" value={display(sheet.speed)} />
            <ReviewField label="PV máx." value={display(sheet.hitPointsMax)} />
            <ReviewField
              label="PV atual"
              value={display(sheet.hitPointsCurrent)}
            />
            <ReviewField
              label="Bônus de proficiência"
              value={display(sheet.proficiencyBonus)}
            />
          </div>
        </ReviewBlock>

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
      </div>

      <ReviewBlock title="Talentos & traços">
        <ReviewText label="Traços da espécie" value={sheet.speciesTraits} />
        <ReviewText label="Class features" value={sheet.classFeatures} />
        <ReviewText label="Feats" value={sheet.feats} />
        <ReviewText label="Cantrips" value={sheet.cantrips} />
      </ReviewBlock>

      {filledWeapons.length > 0 ? (
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
      ) : null}

      {(sheet.spellcastingAbility.trim() || filledSpells.length > 0) && (
        <ReviewBlock title="Magia">
          <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ReviewField
              label="Atributo"
              value={display(sheet.spellcastingAbility)}
            />
            <ReviewField label="CD" value={display(sheet.spellSaveDc)} />
            <ReviewField
              label="Ataque"
              value={display(sheet.spellAttackBonus)}
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
                  Slot {level}: {display(slot.total)} / gastos{" "}
                  {display(slot.expended)}
                </span>
              );
            })}
          </div>
        </ReviewBlock>
      )}

      <ReviewBlock title="Equipamento & história">
        <ReviewText label="Equipamento" value={sheet.equipment} />
        <ReviewText label="Aparência" value={sheet.appearance} />
        <ReviewText label="Backstory" value={sheet.backstory} />
        <ReviewText label="Idiomas" value={sheet.languages} />
        {(sheet.coinsCp || sheet.coinsSp || sheet.coinsGp || sheet.coinsPp) && (
          <ReviewField
            label="Moedas"
            value={`CP ${display(sheet.coinsCp)} · SP ${display(sheet.coinsSp)} · GP ${display(sheet.coinsGp)} · PP ${display(sheet.coinsPp)}`}
          />
        )}
      </ReviewBlock>

      {filledMagicItems.length > 0 ? (
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
      ) : null}

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

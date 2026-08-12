"use client";

import { useClassSpells } from "@/features/catalog/class-catalog/api/use-classes";
import type { ClassSpellOption } from "@/entities/class/types";
import { mysticArcanumSlotsAtLevel } from "@/entities/character/lib/mystic-arcanum";
import {
  SIGNATURE_SPELL_1_KEY,
  SIGNATURE_SPELL_2_KEY,
  SIGNATURE_SPELL_LEVEL,
  signatureSpellKeysAtLevel,
} from "@/entities/character/lib/signature-spells";
import {
  SPELL_MASTERY_LEVEL_1_KEY,
  SPELL_MASTERY_LEVEL_2_KEY,
  SPELL_MASTERY_UNLOCK_LEVEL,
} from "@/features/character/character-sheet/lib/spells/spell-mastery";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";

type SpellClassOptionPicksProps = {
  classSlug: string;
  level: number;
  availableClass: ClassSpellOption[];
  characterSpells: CreateCharacterInput["characterSpells"];
  classOptions: CreateCharacterInput["classOptions"];
  onSetOption: (optionKey: string, valueId: string) => void;
};

function spellOptionsAtLevel(
  available: ClassSpellOption[],
  spellLevel: number,
) {
  return available
    .filter((spell) => spell.level === spellLevel)
    .map((spell) => ({ value: spell.slug, label: spell.name }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt"));
}

function bookSpellOptionsAtLevel(
  available: ClassSpellOption[],
  characterSpells: CreateCharacterInput["characterSpells"],
  spellLevel: number,
) {
  const inBook = new Set(characterSpells.map((spell) => spell.spellSlug));
  return spellOptionsAtLevel(available, spellLevel).filter((option) =>
    inBook.has(option.value),
  );
}

export function SpellClassOptionPicks({
  classSlug,
  level,
  availableClass,
  characterSpells,
  classOptions,
  onSetOption,
}: SpellClassOptionPicksProps) {
  const masteryReady =
    classSlug === "wizard" && level >= SPELL_MASTERY_UNLOCK_LEVEL;
  const signatureKeys = signatureSpellKeysAtLevel(
    classSlug === "wizard" ? level : 0,
  );
  const arcanumSlots =
    classSlug === "warlock" ? mysticArcanumSlotsAtLevel(level) : [];
  const arcanumSpells = useClassSpells(
    "warlock",
    9,
    classSlug === "warlock" && arcanumSlots.length > 0,
  );
  const arcanumCatalog = arcanumSpells.data?.data ?? [];

  if (!masteryReady && signatureKeys.length === 0 && arcanumSlots.length === 0) {
    return null;
  }

  function selected(optionKey: string) {
    return (
      classOptions.find((option) => option.optionKey === optionKey)?.valueId ??
      ""
    );
  }

  return (
    <>
      {masteryReady ? (
        <WizardFormSection title="Maestria de Magias" compact>
          <p className="text-xs text-muted-foreground">
            Escolha uma magia de 1º e uma de 2º círculo já preparadas.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <CatalogSelect
              id={SPELL_MASTERY_LEVEL_1_KEY}
              label="1º círculo"
              options={bookSpellOptionsAtLevel(availableClass, characterSpells, 1)}
              value={selected(SPELL_MASTERY_LEVEL_1_KEY)}
              onChange={(event) =>
                onSetOption(SPELL_MASTERY_LEVEL_1_KEY, event.target.value)
              }
            />
            <CatalogSelect
              id={SPELL_MASTERY_LEVEL_2_KEY}
              label="2º círculo"
              options={bookSpellOptionsAtLevel(availableClass, characterSpells, 2)}
              value={selected(SPELL_MASTERY_LEVEL_2_KEY)}
              onChange={(event) =>
                onSetOption(SPELL_MASTERY_LEVEL_2_KEY, event.target.value)
              }
            />
          </div>
        </WizardFormSection>
      ) : null}

      {signatureKeys.length > 0 ? (
        <WizardFormSection title="Assinatura Mágica" compact>
          <p className="text-xs text-muted-foreground">
            Escolha duas magias de 3º círculo do seu livro.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <CatalogSelect
              id={SIGNATURE_SPELL_1_KEY}
              label="Assinatura 1"
              options={bookSpellOptionsAtLevel(
                availableClass,
                characterSpells,
                SIGNATURE_SPELL_LEVEL,
              )}
              value={selected(SIGNATURE_SPELL_1_KEY)}
              onChange={(event) =>
                onSetOption(SIGNATURE_SPELL_1_KEY, event.target.value)
              }
            />
            <CatalogSelect
              id={SIGNATURE_SPELL_2_KEY}
              label="Assinatura 2"
              options={bookSpellOptionsAtLevel(
                availableClass,
                characterSpells,
                SIGNATURE_SPELL_LEVEL,
              ).filter((option) => option.value !== selected(SIGNATURE_SPELL_1_KEY))}
              value={selected(SIGNATURE_SPELL_2_KEY)}
              onChange={(event) =>
                onSetOption(SIGNATURE_SPELL_2_KEY, event.target.value)
              }
            />
          </div>
        </WizardFormSection>
      ) : null}

      {arcanumSlots.length > 0 ? (
        <WizardFormSection title="Arcana Mística" compact>
          <p className="text-xs text-muted-foreground">
            Uma magia de Bruxo por círculo, conjurada sem espaço 1/DL.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {arcanumSlots.map((slot) => (
              <CatalogSelect
                key={slot.optionKey}
                id={slot.optionKey}
                label={slot.label}
                options={spellOptionsAtLevel(arcanumCatalog, slot.spellLevel)}
                value={selected(slot.optionKey)}
                onChange={(event) =>
                  onSetOption(slot.optionKey, event.target.value)
                }
              />
            ))}
          </div>
        </WizardFormSection>
      ) : null}
    </>
  );
}

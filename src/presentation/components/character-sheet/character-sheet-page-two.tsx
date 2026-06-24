"use client";

import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

import type { CharacterSheet } from "@/application/character-sheet/character-sheet.schema";
import {
  MAGIC_ITEM_ROW_COUNT,
  SPELL_ROW_COUNT,
  SPELL_SLOT_LEVELS,
} from "@/domain/character-sheet/constants";
import { Input } from "@/components/ui/input";
import {
  SheetCheckbox,
  SheetInput,
  SheetSection,
  SheetTextarea,
} from "@/presentation/components/character-sheet/sheet-primitives";

type PageTwoProps = {
  register: UseFormRegister<CharacterSheet>;
  watch: UseFormWatch<CharacterSheet>;
  setValue: UseFormSetValue<CharacterSheet>;
};

export function CharacterSheetPageTwo({
  register,
  watch,
  setValue,
}: PageTwoProps) {
  return (
    <div className="flex flex-col gap-4">
      <SheetSection title="Spellcasting">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SheetInput
            label="Spellcasting Ability"
            {...register("spellcastingAbility")}
          />
          <SheetInput label="Modifier" {...register("spellcastingModifier")} />
          <SheetInput label="Spell Save DC" {...register("spellSaveDc")} />
          <SheetInput
            label="Spell Attack Bonus"
            {...register("spellAttackBonus")}
          />
        </div>
      </SheetSection>

      <SheetSection title="Cantrips & Prepared Spells" collapsible defaultOpen>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                <th className="pb-2 pr-2 font-medium">Name</th>
                <th className="pb-2 pr-2 font-medium">Level</th>
                <th className="pb-2 pr-2 font-medium">Casting Time</th>
                <th className="pb-2 pr-2 font-medium">Range</th>
                <th className="pb-2 pr-2 font-medium">C</th>
                <th className="pb-2 pr-2 font-medium">R</th>
                <th className="pb-2 pr-2 font-medium">Material</th>
                <th className="pb-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: SPELL_ROW_COUNT }).map((_, index) => (
                <tr key={index} className="border-b border-border/60">
                  <td className="py-1.5 pr-2">
                    <Input
                      className="h-7 text-xs"
                      {...register(`spells.${index}.name`)}
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <Input
                      className="h-7 w-14 text-xs"
                      {...register(`spells.${index}.level`)}
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <Input
                      className="h-7 text-xs"
                      {...register(`spells.${index}.castingTime`)}
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <Input
                      className="h-7 text-xs"
                      {...register(`spells.${index}.range`)}
                    />
                  </td>
                  <td className="py-1.5 pr-2 text-center">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={watch(`spells.${index}.concentration`)}
                      onChange={(event) =>
                        setValue(
                          `spells.${index}.concentration`,
                          event.target.checked,
                        )
                      }
                    />
                  </td>
                  <td className="py-1.5 pr-2 text-center">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={watch(`spells.${index}.ritual`)}
                      onChange={(event) =>
                        setValue(`spells.${index}.ritual`, event.target.checked)
                      }
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <Input
                      className="h-7 text-xs"
                      {...register(`spells.${index}.material`)}
                    />
                  </td>
                  <td className="py-1.5">
                    <Input
                      className="h-7 text-xs"
                      {...register(`spells.${index}.notes`)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted-foreground">
            C = Concentration · R = Ritual
          </p>
        </div>
      </SheetSection>

      <SheetSection title="Spell Slots">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SPELL_SLOT_LEVELS.map((level) => (
            <div
              key={level}
              className="rounded-lg border border-border bg-muted/20 p-3"
            >
              <p className="mb-2 text-center text-xs font-semibold uppercase">
                Level {level}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <SheetInput
                  label="Total"
                  compact
                  {...register(`spellSlots.${level}.total`)}
                />
                <SheetInput
                  label="Expended"
                  compact
                  {...register(`spellSlots.${level}.expended`)}
                />
              </div>
            </div>
          ))}
        </div>
      </SheetSection>

      <div className="grid gap-4 lg:grid-cols-2">
        <SheetSection title="Equipment">
          <SheetTextarea {...register("equipment")} className="min-h-40" />
        </SheetSection>

        <SheetSection title="Coins">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <SheetInput label="CP" {...register("coinsCp")} compact />
            <SheetInput label="SP" {...register("coinsSp")} compact />
            <SheetInput label="EP" {...register("coinsEp")} compact />
            <SheetInput label="GP" {...register("coinsGp")} compact />
            <SheetInput label="PP" {...register("coinsPp")} compact />
          </div>
        </SheetSection>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SheetSection title="Appearance">
          <SheetTextarea {...register("appearance")} className="min-h-32" />
        </SheetSection>

        <SheetSection title="Backstory & Personality">
          <SheetTextarea {...register("backstory")} className="min-h-32" />
        </SheetSection>
      </div>

      <SheetSection title="Languages">
        <SheetTextarea {...register("languages")} className="min-h-20" />
      </SheetSection>

      <SheetSection title="Magic Item Attunement">
        <div className="flex flex-col gap-3">
          {Array.from({ length: MAGIC_ITEM_ROW_COUNT }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <SheetCheckbox
                label="Attuned"
                checked={watch(`magicItems.${index}.attuned`)}
                onChange={(value) =>
                  setValue(`magicItems.${index}.attuned`, value)
                }
              />
              <Input
                className="h-8 flex-1"
                placeholder="Magic item name"
                {...register(`magicItems.${index}.name`)}
              />
            </div>
          ))}
        </div>
      </SheetSection>
    </div>
  );
}

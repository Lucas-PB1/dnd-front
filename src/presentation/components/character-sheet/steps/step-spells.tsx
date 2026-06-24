"use client";

import type { CharacterSheetFormProps } from "@/presentation/components/character-sheet/character-sheet-form-props";
import {
  SPELL_ROW_COUNT,
  SPELL_SLOT_LEVELS,
} from "@/domain/character-sheet/constants";
import { Input } from "@/components/ui/input";
import {
  SheetInput,
  SheetSection,
} from "@/presentation/components/character-sheet/sheet-primitives";

export function StepSpells({
  register,
  watch,
  setValue,
}: CharacterSheetFormProps) {
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

      <SheetSection title="Cantrips & Prepared Spells">
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
    </div>
  );
}

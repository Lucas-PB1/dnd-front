"use client";

import type { CharacterSheetFormProps } from "@/features/character-sheet/ui/character-sheet-form-props";
import { WEAPON_ROW_COUNT } from "@/entities/character-sheet/constants";
import { Input } from "@/shared/ui/input";
import {
  SheetInput,
  SheetSection,
  SheetTextarea,
} from "@/features/character-sheet/ui/sheet-primitives";

export function StepEquipment({ register }: CharacterSheetFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <SheetSection title="Weapons & Damage">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                <th className="pb-2 pr-2 font-medium">Name</th>
                <th className="pb-2 pr-2 font-medium">Atk / DC</th>
                <th className="pb-2 pr-2 font-medium">Damage & Type</th>
                <th className="pb-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: WEAPON_ROW_COUNT }).map((_, index) => (
                <tr key={index} className="border-b border-border/60">
                  <td className="py-1.5 pr-2">
                    <Input
                      className="h-7 text-xs"
                      {...register(`weapons.${index}.name`)}
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <Input
                      className="h-7 text-xs"
                      {...register(`weapons.${index}.atkBonus`)}
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <Input
                      className="h-7 text-xs"
                      {...register(`weapons.${index}.damage`)}
                    />
                  </td>
                  <td className="py-1.5">
                    <Input
                      className="h-7 text-xs"
                      {...register(`weapons.${index}.notes`)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { CharacterDetail } from "@/entities/character/types";
import type { ClassOption } from "@/entities/character/sheet-types";
import {
  isClassWeaponMasteryOptionKey,
  parseWeaponMasteryEligibility,
  type ClassWeaponMasterySlot,
} from "@/entities/character/lib/class-weapon-mastery-slots";
import { useClassDetail } from "@/features/class-catalog/api/use-classes";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import {
  fetchAllWeapons,
  weaponKeys,
} from "@/features/equipment-catalog/api/weapons.api";

type LevelUpWeaponMasteryProps = {
  character: CharacterDetail;
  newSlots: readonly ClassWeaponMasterySlot[];
  value: ClassOption[];
  onChange: (next: ClassOption[]) => void;
};

export function LevelUpWeaponMastery({
  character,
  newSlots,
  value,
  onChange,
}: LevelUpWeaponMasteryProps) {
  const classDetail = useClassDetail(character.classSlug, true);
  const weapons = useQuery({
    queryKey: weaponKeys.allMastery(),
    queryFn: fetchAllWeapons,
  });

  const eligibility = useMemo(
    () =>
      parseWeaponMasteryEligibility(
        classDetail.data?.weaponMasteryEligibility,
      ),
    [classDetail.data?.weaponMasteryEligibility],
  );

  const candidates = useMemo(() => {
    const items = weapons.data?.data ?? [];
    return items
      .filter((weapon) => weapon.mastery)
      .filter((weapon) => {
        if (eligibility !== "melee") return true;
        const props = weapon.propertyDetails.map((p) => p.slug);
        return !(props.includes("ammunition") && !props.includes("thrown"));
      })
      .map((weapon) => ({
        value: weapon.slug,
        label: `${weapon.name}${weapon.mastery ? ` · ${weapon.mastery.name}` : ""}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt"));
  }, [weapons.data?.data, eligibility]);

  function setMastery(optionKey: string, valueId: string) {
    const without = value.filter((option) => option.optionKey !== optionKey);
    if (!valueId) {
      onChange(without);
      return;
    }
    onChange([...without, { optionKey, valueId }]);
  }

  if (newSlots.length === 0) return null;

  return (
    <div className="space-y-3 rounded-md border border-border bg-muted/30 px-3 py-3 text-sm">
      <p className="font-medium">Nova Maestria em Arma</p>
      <p className="text-muted-foreground">
        Escolha tipos de arma cuja propriedade de maestria você pode usar
        {eligibility === "melee" ? " (corpo a corpo)" : ""}.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {newSlots.map((slot) => {
          const selected =
            value.find((option) => option.optionKey === slot.optionKey)
              ?.valueId ?? "";
          const takenElsewhere = new Set(
            value
              .filter(
                (option) =>
                  isClassWeaponMasteryOptionKey(option.optionKey) &&
                  option.optionKey !== slot.optionKey,
              )
              .map((option) => option.valueId),
          );
          const selectOptions = candidates.filter(
            (candidate) =>
              candidate.value === selected ||
              !takenElsewhere.has(candidate.value),
          );
          return (
            <CatalogSelect
              key={slot.optionKey}
              id={`level-up-${slot.optionKey}`}
              label={`Maestria (nv. ${slot.unlockLevel})`}
              options={selectOptions}
              value={selected}
              onChange={(event) =>
                setMastery(slot.optionKey, event.target.value)
              }
            />
          );
        })}
      </div>
    </div>
  );
}

export function levelUpWeaponMasteryComplete(
  newSlots: readonly ClassWeaponMasterySlot[],
  classOptions: ClassOption[],
): boolean {
  return newSlots.every((slot) =>
    classOptions.some(
      (option) => option.optionKey === slot.optionKey && option.valueId,
    ),
  );
}

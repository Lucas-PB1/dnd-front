"use client";

import type { CharacterDetail } from "@/entities/character/types";

type CombatEquipmentWarningsProps = {
  character: CharacterDetail;
};

export function CombatEquipmentWarnings({
  character,
}: CombatEquipmentWarningsProps) {
  const equipmentWarnings = character.equipmentWarnings ?? [];
  const hasSpeedPenalty = (character.speedPenaltyMeters ?? 0) > 0;
  const hasArmorCastBlock = character.cannotCastSpellsInArmor;

  if (
    equipmentWarnings.length === 0 &&
    !hasSpeedPenalty &&
    !hasArmorCastBlock
  ) {
    return null;
  }

  return (
    <ul className="mt-2 space-y-1 rounded-lg border border-secondary/35 bg-secondary/5 px-3 py-2 text-xs text-secondary">
      {equipmentWarnings.map((warning) => (
        <li key={`${warning.code}-${warning.itemSlug ?? warning.message}`}>
          {warning.message}
        </li>
      ))}
      {hasSpeedPenalty &&
      !equipmentWarnings.some((warning) => warning.code === "strength_requirement") ? (
        <li>
          Deslocamento −{character.speedPenaltyMeters} m (Força insuficiente).
        </li>
      ) : null}
      {hasArmorCastBlock &&
      !equipmentWarnings.some(
        (warning) => warning.code === "lacks_armor_training",
      ) ? (
        <li>Não pode conjurar com armadura/escudo sem treino.</li>
      ) : null}
    </ul>
  );
}

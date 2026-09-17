import type { CharacterState } from "@/entities/character/session-types";

export type SessionCombatStatusLine = {
  id: string;
  label: string;
};

const STATUS_RULES: Array<{
  id: string;
  label: string;
  active: (state: CharacterState) => boolean;
}> = [
  {
    id: "rage",
    label: "Fúria ativa",
    active: (state) => Boolean(state.rageActive),
  },
  {
    id: "reckless",
    label: "Ataque Imprudente ativo",
    active: (state) => Boolean(state.recklessActive),
  },
  {
    id: "sacred-weapon",
    label: "Arma Sagrada ativa (+Carisma no ataque corpo a corpo)",
    active: (state) => Boolean(state.sacredWeaponActive),
  },
  {
    id: "starry-form",
    label: "Forma Estelar ativa",
    active: (state) => Boolean(state.starryFormActive),
  },
  {
    id: "wild-shape",
    label: "Forma Selvagem ativa",
    active: (state) => Boolean(state.wildShapeActive),
  },
  {
    id: "missile-shield",
    label: "Escudo de Mísseis armado",
    active: (state) => Boolean(state.missileShieldArmed),
  },
  {
    id: "giga-missile",
    label: "Giga Míssil armado",
    active: (state) => Boolean(state.gigaMissileArmed),
  },
];

export function sessionCombatStatusLines(
  state: CharacterState | undefined,
): SessionCombatStatusLine[] {
  if (!state) return [];
  return STATUS_RULES.filter((rule) => rule.active(state)).map(
    ({ id, label }) => ({ id, label }),
  );
}

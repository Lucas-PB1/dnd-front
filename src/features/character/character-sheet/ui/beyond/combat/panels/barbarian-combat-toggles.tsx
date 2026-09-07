"use client";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeBarbarianTableAction,
  type BarbarianTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { CombatToggleChip } from "@/features/character/character-sheet/ui/beyond/combat/shared/combat-toggle-chip";

type BarbarianCombatTogglesProps = {
  characterId: string;
  level: number;
  state: CharacterState | undefined;
  onNote?: (note: string) => void;
};

function rageRemaining(state: CharacterState | undefined): number {
  return state?.classResources?.find((item) => item.slug === "rage")?.remaining ?? 0;
}

/** Fúria e Ataque Imprudente — alterna estado na ficha via table-action. */
export function BarbarianCombatToggles({
  characterId,
  level,
  state,
  onNote,
}: BarbarianCombatTogglesProps) {
  const action = useTableActionMutation(characterId, executeBarbarianTableAction);
  const rageActive = state?.rageActive ?? false;
  const recklessActive = state?.recklessActive ?? false;
  const remaining = rageRemaining(state);
  const canEnterRage = rageActive || remaining > 0;

  function run(slug: BarbarianTableActionSlug) {
    action.mutate(
      { actionSlug: slug },
      {
        onSuccess: (result) => {
          if (result?.note?.trim()) onNote?.(result.note.trim());
        },
      },
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CombatToggleChip
        label={rageActive ? "Fúria ativa" : "Fúria"}
        active={rageActive}
        disabled={!state || action.isPending || !canEnterRage}
        title={
          canEnterRage
            ? rageActive
              ? "Encerrar Fúria"
              : `Entrar em Fúria (gasta 1 uso · ${remaining} restantes)`
            : "Sem usos de Fúria"
        }
        onToggle={() => run("toggle-rage")}
      />
      {level >= 2 ? (
        <CombatToggleChip
          label={recklessActive ? "Imprudente ativo" : "Imprudente"}
          active={recklessActive}
          disabled={!state || action.isPending}
          title={
            recklessActive
              ? "Encerrar Ataque Imprudente"
              : "Ataque Imprudente: vantagem em ataques FOR; inimigos têm vantagem contra você"
          }
          onToggle={() => run("toggle-reckless")}
        />
      ) : null}
    </div>
  );
}

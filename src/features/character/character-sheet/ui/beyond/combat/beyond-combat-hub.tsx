"use client";

import { useState } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import {
  useCharacterState,
  useSpendClassResource,
} from "@/features/character/character-sheet/api/use-character-state";
import type { ResourceDieRoll } from "@/entities/character/session-types";
import { managedClassResourceSlugs } from "@/features/character/character-sheet/lib/combat/managed-class-resources";
import { ClassCombatPanel } from "@/features/character/character-sheet/ui/beyond/combat/class-combat-panel";
import { CombatClassResourcesPanel } from "@/features/character/character-sheet/ui/beyond/combat/combat-class-resources-panel";
import { CombatEquipmentWarnings } from "@/features/character/character-sheet/ui/beyond/combat/combat-equipment-warnings";
import { useRecoverRisk } from "@/features/character/character-sheet/ui/beyond/combat/combat-maneuvers-panel";

type BeyondCombatHubProps = {
  characterId: string;
  character: CharacterDetail;
};

export function BeyondCombatHub({
  characterId,
  character,
}: BeyondCombatHubProps) {
  const stateQuery = useCharacterState(characterId);
  const spendResource = useSpendClassResource(characterId);
  const recoverRiskMutation = useRecoverRisk(characterId);

  const [lastRiskRoll, setLastRiskRoll] = useState<ResourceDieRoll | null>(
    null,
  );

  const state = stateQuery.data;
  const classResources = state?.classResources ?? [];

  return (
    <div className="space-y-2 rounded-xl border border-border/60 bg-card/60 p-2.5 shadow-sm">
      <CombatClassResourcesPanel
        resources={classResources}
        hideSlugs={managedClassResourceSlugs(character.classSlug)}
        isPending={spendResource.isPending || recoverRiskMutation.isPending}
        isError={spendResource.isError}
        error={spendResource.error}
        lastRoll={lastRiskRoll}
        canRecoverRisk={
          character.classSlug === "gunslinger" && character.level >= 15
        }
        onRecoverRisk={() => recoverRiskMutation.mutate()}
        onSpend={(resourceSlug) => {
          spendResource.mutate(
            { resourceSlug },
            {
              onSuccess: (result) => {
                if (result?.roll) setLastRiskRoll(result.roll);
              },
            },
          );
        }}
      />

      <ClassCombatPanel
        characterId={characterId}
        character={character}
        state={state}
      />

      <CombatEquipmentWarnings character={character} />
    </div>
  );
}

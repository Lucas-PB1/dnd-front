"use client";

import type { CharacterDetail } from "@/entities/character/types";
import type { CharacterState } from "@/entities/character/session-types";
import { CombatBarbarianPanel } from "@/features/character/character-sheet/ui/beyond/combat/combat-barbarian-panel";
import { CombatBardPanel } from "@/features/character/character-sheet/ui/beyond/combat/combat-bard-panel";
import { CombatClericPanel } from "@/features/character/character-sheet/ui/beyond/combat/combat-cleric-panel";
import { CombatDruidPanel } from "@/features/character/character-sheet/ui/beyond/combat/combat-druid-panel";
import { CombatFighterPanel } from "@/features/character/character-sheet/ui/beyond/combat/combat-fighter-panel";
import { CombatManeuversPanel } from "@/features/character/character-sheet/ui/beyond/combat/combat-maneuvers-panel";
import { CombatMonkPanel } from "@/features/character/character-sheet/ui/beyond/combat/combat-monk-panel";
import { CombatPaladinPanel } from "@/features/character/character-sheet/ui/beyond/combat/combat-paladin-panel";
import { CombatRangerPanel } from "@/features/character/character-sheet/ui/beyond/combat/combat-ranger-panel";
import { CombatRoguePanel } from "@/features/character/character-sheet/ui/beyond/combat/combat-rogue-panel";
import { CombatSorcererPanel } from "@/features/character/character-sheet/ui/beyond/combat/combat-sorcerer-panel";
import { CombatWarlockPanel } from "@/features/character/character-sheet/ui/beyond/combat/combat-warlock-panel";
import { CombatWizardPanel } from "@/features/character/character-sheet/ui/beyond/combat/combat-wizard-panel";

type ClassCombatPanelProps = {
  characterId: string;
  character: CharacterDetail;
  state: CharacterState | undefined;
};

/** Renderiza só o painel de combate da classe do personagem. */
export function ClassCombatPanel({
  characterId,
  character,
  state,
}: ClassCombatPanelProps) {
  const shared = {
    characterId,
    classSlug: character.classSlug,
    subclassSlug: character.subclassSlug,
    level: character.level,
    combatNotes: character.classCombatNotes,
    state,
  };

  switch (character.classSlug) {
    case "barbarian":
      return (
        <CombatBarbarianPanel
          characterId={characterId}
          classSlug={character.classSlug}
          combatNotes={character.classCombatNotes}
          state={state}
        />
      );
    case "fighter":
      return (
        <CombatFighterPanel
          {...shared}
          attacksPerAction={character.attacksPerAction}
        />
      );
    case "rogue":
      return <CombatRoguePanel {...shared} />;
    case "monk":
      return <CombatMonkPanel {...shared} />;
    case "paladin":
      return <CombatPaladinPanel {...shared} />;
    case "ranger":
      return <CombatRangerPanel {...shared} />;
    case "cleric":
      return <CombatClericPanel {...shared} />;
    case "bard":
      return <CombatBardPanel {...shared} />;
    case "sorcerer":
      return <CombatSorcererPanel {...shared} />;
    case "warlock":
      return <CombatWarlockPanel {...shared} />;
    case "druid":
      return <CombatDruidPanel {...shared} />;
    case "wizard":
      return <CombatWizardPanel {...shared} />;
    case "gunslinger":
      return (
        <CombatManeuversPanel
          characterId={characterId}
          classSlug={character.classSlug}
          level={character.level}
        />
      );
    default:
      return null;
  }
}

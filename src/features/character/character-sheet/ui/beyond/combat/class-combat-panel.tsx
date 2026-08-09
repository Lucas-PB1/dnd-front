"use client";

import type { CharacterDetail } from "@/entities/character/types";
import type { CharacterState } from "@/entities/character/session-types";
import { CombatBarbarianPanel } from "./panels/barbarian-panel";
import { CombatBardPanel } from "./panels/bard-panel";
import { CombatClericPanel } from "./panels/cleric-panel";
import { CombatDruidPanel } from "./panels/druid-panel";
import { CombatFighterPanel } from "./panels/fighter-panel";
import { CombatManeuversPanel } from "./panels/maneuvers-panel";
import { CombatMonkPanel } from "./panels/monk-panel";
import { CombatPaladinPanel } from "./panels/paladin-panel";
import { CombatRangerPanel } from "./panels/ranger-panel";
import { CombatRoguePanel } from "./panels/rogue-panel";
import { CombatSorcererPanel } from "./panels/sorcerer-panel";
import { CombatWarlockPanel } from "./panels/warlock-panel";
import { CombatWizardPanel } from "./panels/wizard-panel";

type ClassCombatPanelProps = {
  characterId: string;
  character: CharacterDetail;
  state: CharacterState | undefined;
  onTableNote?: (note: string) => void;
};

/** Renderiza só o painel de combate da classe do personagem. */
export function ClassCombatPanel({
  characterId,
  character,
  state,
  onTableNote,
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
          onTableNote={onTableNote}
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
      return (
        <CombatSorcererPanel
          {...shared}
          classOptions={character.classOptions}
        />
      );
    case "warlock":
      return (
        <CombatWarlockPanel
          {...shared}
          classOptions={character.classOptions}
        />
      );
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

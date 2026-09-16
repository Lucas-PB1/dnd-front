import type { CharacterState } from "@/entities/character/session-types";

export type FighterTableActionResult = {
  state: CharacterState;
  actionName: string;
  expression?: string;
  roll?: number;
  total?: number;
  saveDc?: number;
  resourceSpent: boolean;
  note: string;
};

export type TableActionResult = FighterTableActionResult;

export type CompanionCommandSlug =
  | "strike"
  | "help"
  | "dash"
  | "disengage"
  | "dodge";

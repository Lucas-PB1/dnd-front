import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

import type { CharacterSheet } from "@/features/character-sheet/model/character-sheet.schema";

export type CharacterSheetFormProps = {
  register: UseFormRegister<CharacterSheet>;
  watch: UseFormWatch<CharacterSheet>;
  setValue: UseFormSetValue<CharacterSheet>;
};

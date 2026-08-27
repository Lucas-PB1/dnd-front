import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";

type SelectOption = {
  value: string;
  label: string;
  hint?: string;
};

type FilterClassOptionSlotSelectOptionsParams<T extends SelectOption> = {
  candidates: T[];
  classOptions: CreateCharacterInput["classOptions"];
  optionKey: string;
  selected: string;
  isMatchingOptionKey: (key: string) => boolean;
};

export function filterClassOptionSlotSelectOptions<T extends SelectOption>({
  candidates,
  classOptions,
  optionKey,
  selected,
  isMatchingOptionKey,
}: FilterClassOptionSlotSelectOptionsParams<T>): T[] {
  const takenElsewhere = new Set(
    classOptions
      .filter(
        (option) =>
          isMatchingOptionKey(option.optionKey) &&
          option.optionKey !== optionKey,
      )
      .map((option) => option.valueId),
  );
  return candidates.filter(
    (candidate) =>
      candidate.value === selected || !takenElsewhere.has(candidate.value),
  );
}

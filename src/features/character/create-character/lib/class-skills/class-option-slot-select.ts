import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";

type SelectOption = {
  value: string;
  label: string;
};

type FilterClassOptionSlotSelectOptionsParams = {
  candidates: SelectOption[];
  classOptions: CreateCharacterInput["classOptions"];
  optionKey: string;
  selected: string;
  isMatchingOptionKey: (key: string) => boolean;
};

export function filterClassOptionSlotSelectOptions({
  candidates,
  classOptions,
  optionKey,
  selected,
  isMatchingOptionKey,
}: FilterClassOptionSlotSelectOptionsParams): SelectOption[] {
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

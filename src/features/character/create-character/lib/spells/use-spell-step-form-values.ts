"use client";

import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { useWatch } from "react-hook-form";

import { asiFeatSlotsToCharacterFeats } from "@/features/character/create-character/lib/feats/asi-feat-slots-to-feats";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";

/** Campos do formulário usados pelo passo de magias. */
export function useSpellStepFormValues(
  control: Control<CreateCharacterInput>,
) {
  const level = useWatch({ control, name: "level", defaultValue: 1 });
  const classSlug = useWatch({ control, name: "classSlug", defaultValue: "" });
  const speciesSlug = useWatch({
    control,
    name: "speciesSlug",
    defaultValue: "",
  });
  const subclassSlug = useWatch({
    control,
    name: "subclassSlug",
    defaultValue: "",
  });
  const speciesChoices = useWatch({
    control,
    name: "speciesChoices",
    defaultValue: [],
  });
  const featOptions = useWatch({
    control,
    name: "featOptions",
    defaultValue: [],
  });
  const asiFeatSlotSlugs = useWatch({
    control,
    name: "asiFeatSlotSlugs",
    defaultValue: [],
  });
  const fightingStyleFeatSlug = useWatch({
    control,
    name: "fightingStyleFeatSlug",
    defaultValue: "",
  });
  const characterSpells = useWatch({
    control,
    name: "characterSpells",
    defaultValue: [],
  });
  const classOptions = useWatch({
    control,
    name: "classOptions",
    defaultValue: [],
  });

  const characterFeats = useMemo(() => {
    const feats = [...asiFeatSlotsToCharacterFeats(asiFeatSlotSlugs ?? [])];
    const fightingStyle = fightingStyleFeatSlug?.trim();
    if (
      fightingStyle &&
      !feats.some((feat) => feat.featSlug === fightingStyle)
    ) {
      feats.push({ featSlug: fightingStyle, instanceIndex: 0 });
    }
    for (const option of featOptions ?? []) {
      if (!feats.some((feat) => feat.featSlug === option.featSlug)) {
        feats.push({
          featSlug: option.featSlug,
          instanceIndex: option.instanceIndex ?? 0,
        });
      }
    }
    return feats;
  }, [asiFeatSlotSlugs, fightingStyleFeatSlug, featOptions]);

  const playerPickedSpells = useMemo(
    () =>
      (characterSpells ?? []).filter(
        (spell) => spell.listType !== "always_prepared",
      ),
    [characterSpells],
  );

  return {
    level: level ?? 1,
    classSlug: classSlug ?? "",
    speciesSlug: speciesSlug ?? "",
    subclassSlug: subclassSlug ?? "",
    speciesChoices: speciesChoices ?? [],
    featOptions: featOptions ?? [],
    characterSpells: characterSpells ?? [],
    classOptions: classOptions ?? [],
    characterFeats,
    playerPickedSpells,
  };
}

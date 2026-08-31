"use client";

import { useMemo } from "react";

import { shortSpeciesSize } from "@/entities/species/short-size";
import { resolveTraitPackageSlug } from "@/entities/species/species-culture";
import {
  DetailTileGrid,
  type DetailTileItem,
} from "@/features/character/character-sheet/ui/sections/detail-tile-grid";
import type { SheetReadSectionProps } from "@/features/character/character-sheet/ui/sections/sheet-section-types";
import {
  useSpeciesDetail,
  useSpeciesTraitChoices,
  useSpeciesTraits,
} from "@/features/catalog/species-catalog/api/use-species";
import { PhbProse } from "@/shared/ui/phb-prose";

function isSizeChoiceKind(choiceKind: string): boolean {
  return (
    choiceKind === "size" ||
    choiceKind === "creature_size" ||
    choiceKind === "tamanho" ||
    choiceKind.endsWith("_size")
  );
}

export function PhbSpeciesChoicesSection({
  character,
}: Pick<SheetReadSectionProps, "character">) {
  const speciesSlug = character.speciesSlug ?? "";
  const speciesDetail = useSpeciesDetail(speciesSlug, !!speciesSlug);
  const traitPackageSlug = useMemo(
    () =>
      resolveTraitPackageSlug(speciesSlug, character.speciesChoices),
    [speciesSlug, character.speciesChoices],
  );
  const traitsQuery = useSpeciesTraits(traitPackageSlug, !!traitPackageSlug);
  const traitChoices = useSpeciesTraitChoices(
    speciesSlug,
    character.speciesChoices.length > 0 && !!speciesSlug,
  );

  const resolved = useMemo(() => {
    const rows = traitChoices.data?.data ?? [];
    return character.speciesChoices.map((choice) => {
      const match = rows.find(
        (r) =>
          r.choiceKind === choice.choiceKind &&
          r.choiceSlug === choice.choiceSlug,
      );
      return {
        ...choice,
        traitName: match?.traitName ?? choice.choiceKind,
        choiceName: match?.choiceName ?? choice.choiceSlug,
        level1Benefit: match?.level1Benefit ?? null,
      };
    });
  }, [character.speciesChoices, traitChoices.data?.data]);

  const fixedTraits = (traitsQuery.data?.data ?? []).filter(
    (trait) => !trait.choiceKind,
  );

  const fixedItems: DetailTileItem[] = fixedTraits.map((trait) => ({
    id: `fixed-${trait.name}`,
    title: trait.name,
    body: trait.description ? (
      <PhbProse text={trait.description} />
    ) : (
      <p className="text-sm text-muted-foreground">Sem descrição.</p>
    ),
  }));

  const sizeChoice = resolved.find((item) =>
    isSizeChoiceKind(item.choiceKind),
  );
  const displaySize = sizeChoice
    ? sizeChoice.choiceName
    : speciesDetail.data?.size
      ? shortSpeciesSize(speciesDetail.data.size)
      : null;
  const displaySpeed = speciesDetail.data?.speed ?? null;

  const choiceItems: DetailTileItem[] = resolved
    .filter((item) => !isSizeChoiceKind(item.choiceKind))
    .map((item) => ({
      id: `${item.choiceKind}-${item.choiceSlug}`,
      title: item.choiceName,
      subtitle: item.traitName,
      accent: true,
      body: item.level1Benefit ? (
        <PhbProse text={item.level1Benefit} />
      ) : (
        <p className="text-sm text-muted-foreground">Sem descrição adicional.</p>
      ),
    }));

  return (
    <div className="space-y-4">
      {speciesDetail.data ? (
        <dl className="grid gap-2 grid-cols-3 text-center sm:text-left">
          <div className="rounded-lg border border-border/50 bg-background/40 px-2 py-1.5">
            <dt className="text-[0.58rem] font-semibold tracking-wide text-muted-foreground uppercase">
              Tipo
            </dt>
            <dd className="text-sm font-medium">
              {speciesDetail.data.creatureType}
            </dd>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/40 px-2 py-1.5">
            <dt className="text-[0.58rem] font-semibold tracking-wide text-muted-foreground uppercase">
              Tamanho
            </dt>
            <dd className="text-sm font-medium">{displaySize ?? "—"}</dd>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/40 px-2 py-1.5">
            <dt className="text-[0.58rem] font-semibold tracking-wide text-muted-foreground uppercase">
              Desloc.
            </dt>
            <dd className="text-sm font-medium">{displaySpeed ?? "—"}</dd>
          </div>
        </dl>
      ) : null}

      {traitsQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Carregando traços…</p>
      ) : fixedItems.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Traços fixos
          </p>
          <DetailTileGrid items={fixedItems} hint="Toque para ler o traço." />
        </div>
      ) : null}

      {character.speciesChoices.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma escolha de traço registrada.
        </p>
      ) : traitChoices.isPending ? (
        <div className="space-y-1.5">
          <p className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Escolhas
          </p>
          <p className="text-sm text-muted-foreground">Carregando escolhas…</p>
        </div>
      ) : choiceItems.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Escolhas
          </p>
          <DetailTileGrid items={choiceItems} />
        </div>
      ) : null}
    </div>
  );
}

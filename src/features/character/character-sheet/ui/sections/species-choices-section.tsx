"use client";

import { useMemo } from "react";

import type { SheetReadSectionProps } from "@/features/character/character-sheet/ui/sections/sheet-section-types";
import {
  useSpeciesDetail,
  useSpeciesTraitChoices,
  useSpeciesTraits,
} from "@/features/catalog/species-catalog/api/use-species";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";

export function SpeciesChoicesSection({
  character,
}: Pick<SheetReadSectionProps, "character">) {
  const speciesDetail = useSpeciesDetail(
    character.speciesSlug,
    !!character.speciesSlug,
  );
  const traitsQuery = useSpeciesTraits(
    character.speciesSlug,
    !!character.speciesSlug,
  );
  const traitChoices = useSpeciesTraitChoices(
    character.speciesSlug,
    character.speciesChoices.length > 0,
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

  return (
    <div className="space-y-5">
      {speciesDetail.data ? (
        <dl className="grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Tipo
            </dt>
            <dd className="text-sm font-medium">
              {speciesDetail.data.creatureType}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Tamanho
            </dt>
            <dd className="text-sm font-medium">{speciesDetail.data.size}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Deslocamento
            </dt>
            <dd className="text-sm font-medium">{speciesDetail.data.speed}</dd>
          </div>
        </dl>
      ) : null}

      {traitsQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Carregando traços…</p>
      ) : fixedTraits.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Traços fixos
          </p>
          <div className="space-y-2">
            {fixedTraits.map((trait) => (
              <CollapsibleCard
                key={trait.name}
                title={trait.name}
                size="compact"
                defaultOpen={false}
                className="bg-background/50"
              >
                {trait.description ? (
                  <PhbProse text={trait.description} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sem descrição.
                  </p>
                )}
              </CollapsibleCard>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Escolhas
        </p>
        {character.speciesChoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma escolha de traço registrada.
          </p>
        ) : traitChoices.isPending ? (
          <p className="text-sm text-muted-foreground">Carregando escolhas…</p>
        ) : (
          <ul className="space-y-1.5">
            {resolved.map((item) => (
              <li key={`${item.choiceKind}-${item.choiceSlug}`}>
                <CollapsibleCard
                  title={item.choiceName}
                  subtitle={item.traitName}
                  size="compact"
                  defaultOpen={false}
                  className="bg-background/50"
                >
                  {item.level1Benefit ? (
                    <PhbProse text={item.level1Benefit} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Sem descrição adicional.
                    </p>
                  )}
                </CollapsibleCard>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

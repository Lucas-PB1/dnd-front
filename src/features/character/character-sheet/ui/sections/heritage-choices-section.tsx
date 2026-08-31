"use client";

import { useMemo } from "react";

import {
  aggregateTraitTakes,
  resolveHeritageDisplaySpeed,
  HERITAGE_SIZE_KIND,
  HERITAGE_SPEED_TRADE_KIND,
} from "@/entities/heritage/types";
import type { AggregatedHeritageTrait } from "@/entities/heritage/types";
import {
  DetailTileGrid,
  type DetailTileItem,
} from "@/features/character/character-sheet/ui/sections/detail-tile-grid";
import type { SheetReadSectionProps } from "@/features/character/character-sheet/ui/sections/sheet-section-types";
import {
  useHeritageDetail,
  useHeritageTraitChoices,
} from "@/features/catalog/heritage-catalog/api/use-heritages";
import { shortSpeciesSize } from "@/entities/species/short-size";
import { heritageOriginKindLabel } from "@/entities/heritage/origin-label";
import { PhbProse } from "@/shared/ui/phb-prose";

function resolveActiveBenefits(
  traitSlug: string,
  takeCount: number,
  catalog: readonly {
    traitSlug: string;
    benefitBase: string | null;
    benefitImproved: string | null;
  }[],
): string[] {
  const row = catalog.find((entry) => entry.traitSlug === traitSlug);
  if (!row) return [];
  const benefits: string[] = [];
  if (row.benefitBase?.trim() && takeCount >= 1) {
    benefits.push(row.benefitBase.trim());
  }
  if (row.benefitImproved?.trim() && takeCount >= 2) {
    benefits.push(row.benefitImproved.trim());
  }
  return benefits;
}

function buildAggregatedTiles(
  aggregated: AggregatedHeritageTrait[],
  catalog: readonly {
    traitSlug: string;
    traitName: string;
    benefitBase: string | null;
    benefitImproved: string | null;
  }[],
): DetailTileItem[] {
  return aggregated.map((entry) => {
    const meta = catalog.find((row) => row.traitSlug === entry.traitSlug);
    const activeBenefits =
      entry.activeBenefits.length > 0
        ? entry.activeBenefits
        : resolveActiveBenefits(entry.traitSlug, entry.takeCount, catalog);
    const title = meta?.traitName ?? entry.traitSlug;
    const subtitle =
      entry.takeCount > 1 ? `${entry.takeCount}× selecionado` : undefined;

    return {
      id: entry.traitSlug,
      title,
      subtitle,
      accent: entry.takeCount > 1,
      body:
        activeBenefits.length > 0 ? (
          <div className="space-y-2">
            {activeBenefits.map((text, index) => (
              <PhbProse key={`${entry.traitSlug}-${index}`} text={text} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sem descrição adicional.</p>
        ),
    };
  });
}

export function HeritageChoicesSection({
  character,
}: Pick<SheetReadSectionProps, "character">) {
  const heritageSlug = character.heritageSlug ?? "";
  const heritageDetail = useHeritageDetail(heritageSlug, !!heritageSlug);
  const traitChoices = useHeritageTraitChoices(heritageSlug, !!heritageSlug);

  const catalog = useMemo(
    () =>
      (traitChoices.data ?? [])
        .filter((row) => row.choiceKind.startsWith("heritage_trait_"))
        .map((row) => ({
          traitSlug: row.traitSlug,
          traitName: row.traitName,
          benefitBase: row.benefitBase,
          benefitImproved: row.benefitImproved,
        })),
    [traitChoices.data],
  );

  const aggregated = useMemo(() => {
    const picks = character.heritageChoices ?? [];
    const fromApi = character.aggregatedHeritageTraits;
    if (fromApi && fromApi.length > 0) {
      return fromApi.map((entry) => ({
        ...entry,
        activeBenefits: entry.activeBenefits ?? [],
      }));
    }
    return aggregateTraitTakes(picks).map((entry) => ({
      ...entry,
      activeBenefits: resolveActiveBenefits(
        entry.traitSlug,
        entry.takeCount,
        catalog,
      ),
    }));
  }, [character.aggregatedHeritageTraits, character.heritageChoices, catalog]);

  const sizeChoice = (character.heritageChoices ?? []).find(
    (choice) => choice.choiceKind === HERITAGE_SIZE_KIND,
  );
  const displaySize = sizeChoice
    ? sizeChoice.choiceSlug === "small"
      ? "Pequeno"
      : sizeChoice.choiceSlug === "medium"
        ? "Médio"
        : sizeChoice.choiceSlug
    : heritageDetail.data?.sizeRule
      ? shortSpeciesSize(heritageDetail.data.sizeRule)
      : null;

  const displaySpeed = resolveHeritageDisplaySpeed(
    heritageDetail.data?.speedRule ?? null,
    character.heritageChoices ?? [],
  );

  const configItems: DetailTileItem[] = [];
  const speedTrade = (character.heritageChoices ?? []).find(
    (choice) => choice.choiceKind === HERITAGE_SPEED_TRADE_KIND,
  );
  if (speedTrade) {
    configItems.push({
      id: "speed-trade",
      title: "Troca de deslocamento",
      body: (
        <p className="text-sm">
          {speedTrade.choiceSlug === "yes"
            ? "−1,5 m de deslocamento por 9º traço."
            : "Deslocamento base mantido."}
        </p>
      ),
    });
  }

  const traitItems = buildAggregatedTiles(aggregated, catalog);

  return (
    <div className="space-y-4">
      {heritageDetail.data ? (
        <>
          <div className="space-y-1">
            <p className="font-heading text-sm font-semibold">
              {heritageDetail.data.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {heritageDetail.data.tagline ?? heritageOriginKindLabel()}
            </p>
          </div>
          <dl className="grid gap-2 grid-cols-3 text-center sm:text-left">
            <div className="rounded-lg border border-border/50 bg-background/40 px-2 py-1.5">
              <dt className="text-[0.58rem] font-semibold tracking-wide text-muted-foreground uppercase">
                Tipo
              </dt>
              <dd className="text-sm font-medium">
                {heritageDetail.data.creatureType}
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
        </>
      ) : null}

      {traitChoices.isPending ? (
        <p className="text-sm text-muted-foreground">Carregando traços…</p>
      ) : traitItems.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Traços modulares
          </p>
          <DetailTileGrid items={traitItems} hint="Toque para ler o traço." />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhum traço de variante registrado.
        </p>
      )}

      {configItems.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Customização
          </p>
          <DetailTileGrid items={configItems} />
        </div>
      ) : null}
    </div>
  );
}

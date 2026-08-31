"use client";

import { Suspense, useCallback, useMemo } from "react";

import { heritageCategoryLabel } from "@/entities/heritage/category-label";
import type {
  HeritageDetail,
  HeritageModularTrait,
  HeritageTraditionalTrait,
} from "@/entities/heritage/types";
import {
  useHeritageDetail,
  useHeritageModularTraits,
  useHeritageTraditionalBuild,
} from "@/features/catalog/heritage-catalog/api/use-heritages";
import { useCatalogBackHref } from "@/shared/lib/use-catalog-back-href";
import {
  CatalogDetailError,
  CatalogDetailHero,
} from "@/shared/ui/catalog-detail-hero";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { useClientPaginatedSearch } from "@/shared/lib/use-client-paginated-search";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { PhbProse } from "@/shared/ui/phb-prose";

const TRAITS_PER_PAGE = 12;

type HeritageDetailViewProps = {
  slug: string;
};

const HERITAGE_TRAIT_CATEGORY_LABEL: Record<string, string> = {
  combat: "Combate",
  exploration: "Exploração",
  roleplaying: "Interpretação",
};

type TraitPoolEntry = {
  traitSlug: string;
  traitName: string;
  categoryLabel: string;
  benefitBase: string | null;
  benefitImproved: string | null;
  isTraditional: boolean;
};

function buildTraitPool(
  traits: HeritageModularTrait[],
  traditionalSlugs: ReadonlySet<string>,
): TraitPoolEntry[] {
  const bySlug = new Map<string, TraitPoolEntry>();
  for (const trait of traits) {
    if (bySlug.has(trait.slug)) continue;
    bySlug.set(trait.slug, {
      traitSlug: trait.slug,
      traitName: trait.name,
      categoryLabel:
        HERITAGE_TRAIT_CATEGORY_LABEL[trait.category] ?? trait.category,
      benefitBase: trait.benefitBase,
      benefitImproved: trait.benefitImproved,
      isTraditional: traditionalSlugs.has(trait.slug),
    });
  }
  return [...bySlug.values()].sort((left, right) =>
    left.traitName.localeCompare(right.traitName, "pt"),
  );
}

function groupTraitPool(entries: TraitPoolEntry[]) {
  const groups = new Map<string, TraitPoolEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.categoryLabel) ?? [];
    list.push(entry);
    groups.set(entry.categoryLabel, list);
  }
  const order = ["Combate", "Exploração", "Interpretação"];
  return order
    .filter((label) => groups.has(label))
    .map((label) => [label, groups.get(label)!] as const);
}

function HeritageHero({
  heritage,
  backHref,
}: {
  heritage: HeritageDetail;
  backHref: string;
}) {
  const stats = [
    { label: "Tipo", value: heritage.creatureType },
    { label: "Tamanho", value: heritage.sizeRule },
    { label: "Deslocamento", value: heritage.speedRule },
    {
      label: "Raridade",
      value: heritageCategoryLabel(heritage.category),
    },
  ];

  return (
    <CatalogDetailHero
      backHref={backHref}
      backLabel="Heranças"
      title={heritage.name}
      eyebrow={heritage.tagline}
      summary={heritage.summary}
      stats={stats}
      imageUrl={heritage.imageUrl}
    />
  );
}

function TraditionalBuildList({
  traits,
}: {
  traits: HeritageTraditionalTrait[];
}) {
  if (traits.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta variante não tem build tradicional sugerido — monte os 8 traços
        livremente do pool global.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {traits.map((trait, index) => (
        <li
          key={`${trait.traitSlug}-${index}`}
          className="flex gap-3 border-l-2 border-primary/40 pl-3"
        >
          <span className="text-xs font-semibold text-muted-foreground tabular-nums">
            {index + 1}.
          </span>
          <div className="min-w-0 space-y-0.5">
            <p className="font-medium text-foreground">{trait.traitName}</p>
            <p className="text-xs text-muted-foreground">
              {trait.categoryHint || trait.category}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function TraitPoolSection({ entries }: { entries: TraitPoolEntry[] }) {
  const getSearchText = useCallback(
    (entry: TraitPoolEntry) =>
      [
        entry.traitName,
        entry.categoryLabel,
        entry.benefitBase ?? "",
        entry.benefitImproved ?? "",
      ].join(" "),
    [],
  );

  const {
    query,
    setQuery,
    pagedItems: pagedEntries,
    page,
    setPage,
    totalPages,
    total,
    from,
    to,
  } = useClientPaginatedSearch({
    items: entries,
    getSearchText,
    pageSize: TRAITS_PER_PAGE,
  });

  const grouped = groupTraitPool(pagedEntries);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Pool de traços indisponível.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar traço por nome, categoria ou benefício…"
        resultCount={query.trim() ? total : undefined}
      />

      {total === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum traço corresponde à busca.
        </p>
      ) : (
        <>
      {grouped.map(([category, traits]) => (
        <div key={category} className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            {category}
          </p>
          <div className="space-y-2">
            {traits.map((trait) => (
              <CollapsibleCard
                key={trait.traitSlug}
                title={trait.traitName}
                subtitle={
                  trait.isTraditional ? "Sugerido no build tradicional" : undefined
                }
              >
                <div className="space-y-3">
                  {trait.benefitBase ? (
                    <PhbProse text={trait.benefitBase} className="text-sm" />
                  ) : null}
                  {trait.benefitImproved ? (
                    <div className="space-y-1 border-t border-border/60 pt-3">
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Benefício aprimorado (2×)
                      </p>
                      <PhbProse
                        text={trait.benefitImproved}
                        className="text-sm text-muted-foreground"
                      />
                    </div>
                  ) : null}
                </div>
              </CollapsibleCard>
            ))}
          </div>
        </div>
      ))}

      <CatalogPagination
        page={page}
        totalPages={totalPages}
        total={total}
        from={from}
        to={to}
        onPageChange={setPage}
      />
        </>
      )}
    </div>
  );
}

export function HeritageDetailView({ slug }: HeritageDetailViewProps) {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}
    >
      <HeritageDetailBody slug={slug} />
    </Suspense>
  );
}

function HeritageDetailBody({ slug }: HeritageDetailViewProps) {
  const heritageQuery = useHeritageDetail(slug);
  const traditionalQuery = useHeritageTraditionalBuild(slug, !!slug);
  const modularTraitsQuery = useHeritageModularTraits(slug, !!slug);
  const backHref = useCatalogBackHref("/heritages");

  const traditionalSlugs = useMemo(
    () => new Set((traditionalQuery.data ?? []).map((row) => row.traitSlug)),
    [traditionalQuery.data],
  );

  const traitPool = useMemo(
    () => buildTraitPool(modularTraitsQuery.data ?? [], traditionalSlugs),
    [modularTraitsQuery.data, traditionalSlugs],
  );

  if (heritageQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (heritageQuery.isError || !heritageQuery.data) {
    return (
      <CatalogDetailError
        backHref={backHref}
        message={
          heritageQuery.error instanceof Error
            ? heritageQuery.error.message
            : "Herança não encontrada"
        }
      />
    );
  }

  const heritage = heritageQuery.data;
  const traditional = traditionalQuery.data ?? [];

  return (
    <div className="flex flex-col gap-12">
      <HeritageHero heritage={heritage} backHref={backHref} />

      {heritage.description ? (
        <section aria-labelledby="heritage-about" className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wider text-primary uppercase">
              Lore
            </p>
            <h2
              id="heritage-about"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Sobre a variante
            </h2>
          </div>
          <div className="relative border-l-2 border-primary/50 pl-5 sm:pl-6">
            <PhbProse
              text={heritage.description}
              className="text-base leading-relaxed text-justify text-foreground/85 [&_p]:text-justify [&_p]:text-foreground/85"
            />
          </div>
        </section>
      ) : null}

      {(heritage.allowsSpeedTrade || heritage.allowsSizeChoice) && (
        <section aria-labelledby="heritage-custom" className="space-y-4">
          <div className="space-y-1">
            <h2
              id="heritage-custom"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Customização
            </h2>
            <p className="text-sm text-muted-foreground">
              Opções extras ao montar os 8 traços modulares.
            </p>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {heritage.allowsSizeChoice ? (
              <li>
                <span className="font-medium text-foreground">
                  Tamanho:{" "}
                </span>
                Pequeno ou Médio (escolha na criação).
              </li>
            ) : null}
            {heritage.allowsSpeedTrade ? (
              <li>
                <span className="font-medium text-foreground">
                  Troca de deslocamento:{" "}
                </span>
                −1,5 m para ganhar um 9º traço modular.
              </li>
            ) : null}
          </ul>
        </section>
      )}

      <section aria-labelledby="heritage-traditional" className="space-y-4">
        <div className="space-y-1">
          <h2
            id="heritage-traditional"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Build tradicional
          </h2>
          <p className="text-sm text-muted-foreground">
            Oito traços sugeridos pelo livro (3 Combate + 3 Exploração + 2
            Interpretação). Você pode trocar livremente por qualquer traço do
            pool global.
          </p>
        </div>
        {traditionalQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Carregando preset…</p>
        ) : (
          <TraditionalBuildList traits={traditional} />
        )}
      </section>

      <section aria-labelledby="heritage-pool" className="space-y-4">
        <div className="space-y-1">
          <h2
            id="heritage-pool"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Pool de traços modulares
          </h2>
          <p className="text-sm text-muted-foreground">
            Referência do pool global (~107 traços). Na criação, escolha
            exatamente 8 — repetir um traço aplica o benefício aprimorado quando
            disponível.
          </p>
        </div>
        {modularTraitsQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Carregando traços…</p>
        ) : modularTraitsQuery.isError ? (
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar o pool de traços desta variante.
          </p>
        ) : (
          <TraitPoolSection entries={traitPool} />
        )}
      </section>
    </div>
  );
}

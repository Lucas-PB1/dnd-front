"use client";

import { Suspense, useMemo } from "react";

import type {
  BackgroundEquipmentOption,
  BackgroundSummary,
} from "@/entities/background/types";
import {
  useBackgroundDetail,
  useBackgroundEquipment,
  useBackgroundSkills,
  useBackgroundTools,
} from "@/features/background-catalog/api/use-backgrounds";
import { useCatalogBackHref } from "@/shared/lib/use-catalog-back-href";
import {
  CatalogDetailError,
  CatalogDetailHero,
} from "@/shared/ui/catalog-detail-hero";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";

type BackgroundDetailViewProps = {
  slug: string;
};

function BackgroundHero({
  background,
  skillNames,
  backHref,
}: {
  background: BackgroundSummary;
  skillNames: string[];
  backHref: string;
}) {
  const toolLabel =
    background.toolProficiencyKind === "fixed"
      ? (background.toolItemName ?? background.toolItemSlug)
      : background.toolProficiencyKind === "choice"
        ? (background.toolCategoryName ??
          background.toolProficiencyDescription ??
          "À escolha")
        : null;

  const stats: { label: string; value: string }[] = [];
  if (background.abilityOptionNames?.length) {
    stats.push({
      label: "Atributos",
      value: background.abilityOptionNames.join(", "),
    });
  }
  if (background.originFeatName || background.originFeatSlug) {
    stats.push({
      label: "Talento",
      value: background.originFeatName ?? background.originFeatSlug!,
    });
  }
  if (skillNames.length) {
    stats.push({ label: "Perícias", value: skillNames.join(", ") });
  }
  if (toolLabel) {
    stats.push({ label: "Ferramenta", value: toolLabel });
  }
  if (background.equipmentGoldOption != null) {
    stats.push({
      label: "Ouro (opção)",
      value: `${background.equipmentGoldOption} PO`,
    });
  }

  return (
    <CatalogDetailHero
      backHref={backHref}
      backLabel="Antecedentes"
      title={background.name}
      eyebrow={background.tagline}
      summary={background.summary}
      stats={stats}
      statsClassName={
        stats.length > 0
          ? stats.length >= 4
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
            : "grid-cols-1 sm:grid-cols-3"
          : undefined
      }
    />
  );
}

function groupEquipmentByPackage(items: BackgroundEquipmentOption[]) {
  const map = new Map<
    string,
    { label: string; gold: number | null; items: BackgroundEquipmentOption[] }
  >();
  for (const item of items) {
    const existing = map.get(item.packageSlug);
    if (existing) {
      existing.items.push(item);
    } else {
      map.set(item.packageSlug, {
        label: item.packageLabel,
        gold: item.packageGold,
        items: [item],
      });
    }
  }
  return [...map.entries()];
}

function BackgroundDetailBody({ slug }: BackgroundDetailViewProps) {
  const detailQuery = useBackgroundDetail(slug);
  const backHref = useCatalogBackHref("/backgrounds");
  const skillsQuery = useBackgroundSkills(
    slug,
    !!slug && !detailQuery.isPending && !detailQuery.isError,
  );
  const equipmentQuery = useBackgroundEquipment(slug, !!slug);
  const needsToolChoice = detailQuery.data?.toolProficiencyKind === "choice";
  const toolsQuery = useBackgroundTools(slug, needsToolChoice);

  const skillNames = useMemo(
    () => (skillsQuery.data?.data ?? []).map((s) => s.name),
    [skillsQuery.data?.data],
  );

  const equipmentByPackage = useMemo(
    () => groupEquipmentByPackage(equipmentQuery.data?.data ?? []),
    [equipmentQuery.data?.data],
  );

  if (detailQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <CatalogDetailError
        backHref={backHref}
        message={
          detailQuery.error instanceof Error
            ? detailQuery.error.message
            : "Antecedente não encontrado"
        }
      />
    );
  }

  const background = detailQuery.data;

  return (
    <div className="flex flex-col gap-12">
      <BackgroundHero
        background={background}
        skillNames={skillNames}
        backHref={backHref}
      />

      {background.description ? (
        <section aria-labelledby="background-about" className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wider text-primary uppercase">
              Lore
            </p>
            <h2
              id="background-about"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Sobre o antecedente
            </h2>
          </div>
          <div className="relative border-l-2 border-primary/50 pl-5 sm:pl-6">
            <PhbProse
              text={background.description}
              className="text-base leading-relaxed text-justify text-foreground/85 [&_p]:text-justify [&_p]:text-foreground/85"
            />
          </div>
        </section>
      ) : null}

      {needsToolChoice ? (
        <section aria-labelledby="background-tools" className="space-y-4">
          <CollapsibleCard
            title="Opções de ferramenta"
            subtitle={
              background.toolProficiencyDescription ??
              background.toolCategoryName ??
              undefined
            }
            defaultOpen={false}
          >
            {toolsQuery.isPending ? (
              <p className="text-sm text-muted-foreground">
                Carregando opções…
              </p>
            ) : toolsQuery.isError || !toolsQuery.data?.data.length ? (
              <p className="text-sm text-muted-foreground">
                Sem opções cadastradas.
              </p>
            ) : (
              <ul className="columns-1 gap-x-8 sm:columns-2">
                {toolsQuery.data.data.map((tool) => (
                  <li
                    key={tool.itemSlug}
                    className="mb-2 list-none break-inside-avoid"
                  >
                    <span className="inline-flex items-start gap-2 text-sm">
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden
                      />
                      <span>{tool.itemName}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CollapsibleCard>
        </section>
      ) : null}

      <section aria-labelledby="background-equipment" className="space-y-4">
        <div className="space-y-1">
          <h2
            id="background-equipment"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Equipamento inicial
          </h2>
          <p className="text-sm text-muted-foreground">
            Pacotes de partida do PHB
            {background.equipmentGoldOption != null
              ? ` — ou ${background.equipmentGoldOption} PO no lugar`
              : ""}
            .
          </p>
        </div>

        {equipmentQuery.isPending ? (
          <p className="text-sm text-muted-foreground">
            Carregando equipamento…
          </p>
        ) : equipmentQuery.isError || !equipmentByPackage.length ? (
          <p className="text-sm text-muted-foreground">
            Sem equipamento cadastrado.
          </p>
        ) : (
          <div className="space-y-3">
            {equipmentByPackage.map(([packageSlug, pkg]) => (
              <CollapsibleCard
                key={packageSlug}
                title={`Pacote ${pkg.label}`}
                subtitle={
                  pkg.gold != null ? `${pkg.gold} PO no pacote` : undefined
                }
              >
                <ul className="space-y-2">
                  {pkg.items.map((item, index) => (
                    <li
                      key={`${item.itemSlug ?? item.choiceText}-${index}`}
                      className="text-sm"
                    >
                      {item.itemName
                        ? `${item.quantity && item.quantity > 1 ? `${item.quantity}× ` : ""}${item.itemName}`
                        : (item.choiceText ?? "—")}
                    </li>
                  ))}
                </ul>
              </CollapsibleCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function BackgroundDetailView({ slug }: BackgroundDetailViewProps) {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}
    >
      <BackgroundDetailBody slug={slug} />
    </Suspense>
  );
}

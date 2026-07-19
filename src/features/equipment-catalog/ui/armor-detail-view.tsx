"use client";

import Link from "next/link";

import type { ArmorSummary } from "@/entities/armor/types";
import { useArmorDetail } from "@/features/equipment-catalog/api/use-equipment";
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/ui/back-link";
import { buttonVariants } from "@/shared/ui/button";

type ArmorDetailViewProps = {
  slug: string;
};

function ArmorHero({ armor }: { armor: ArmorSummary }) {
  const stats: { label: string; value: string }[] = [
    { label: "Categoria", value: armor.categoryName },
  ];
  const ac =
    armor.acFormula ?? (armor.acBase != null ? String(armor.acBase) : null);
  if (ac) stats.push({ label: "CA", value: ac });
  if (armor.strengthReq != null) {
    stats.push({ label: "Força", value: `${armor.strengthReq}+` });
  }
  stats.push({
    label: "Furtividade",
    value: armor.stealthDisadvantage ? "Desvantagem" : "Normal",
  });
  if (armor.donDoff) {
    stats.push({ label: "Vestir", value: armor.donDoff });
  }

  return (
    <header className="relative overflow-hidden rounded-xl border border-border">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--secondary)_14%,transparent),transparent_50%)]"
        aria-hidden
      />
      <div className="relative space-y-6 p-5 sm:p-8">
        <BackLink href="/equipment?tab=armor">Equipamento</BackLink>

        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {armor.name}
          </h1>
          <p className="max-w-xl text-sm font-medium tracking-wide text-primary uppercase sm:text-base">
            {armor.categoryName}
          </p>
        </div>

        <dl
          className={cn(
            "grid gap-px overflow-hidden rounded-lg border border-border bg-border",
            stats.length >= 3
              ? "grid-cols-2 sm:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2",
          )}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card/80 px-3 py-3 backdrop-blur-sm sm:px-4"
            >
              <dt className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
                {stat.label}
              </dt>
              <dd className="mt-1 font-heading text-base font-semibold leading-tight sm:text-lg">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}

export function ArmorDetailView({ slug }: ArmorDetailViewProps) {
  const { data, isPending, isError, error } = useArmorDetail(slug);

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando armadura…</p>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Armadura não encontrada"}
        </p>
        <Link
          href="/equipment?tab=armor"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Voltar ao equipamento
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <ArmorHero armor={data} />
    </div>
  );
}

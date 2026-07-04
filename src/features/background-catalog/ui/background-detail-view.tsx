"use client";

import Link from "next/link";

import {
  useBackgroundDetail,
  useBackgroundSkills,
  useBackgroundTools,
} from "@/features/background-catalog/api/use-backgrounds";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type BackgroundDetailViewProps = {
  slug: string;
};

export function BackgroundDetailView({ slug }: BackgroundDetailViewProps) {
  const { data, isPending, isError, error } = useBackgroundDetail(slug);
  const skills = useBackgroundSkills(slug, !!slug && !isPending && !isError);
  const needsToolChoice = data?.toolProficiencyKind === "choice";
  const tools = useBackgroundTools(slug, needsToolChoice);

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Antecedente não encontrado"}
        </p>
        <Link
          href="/backgrounds"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Link
          href="/backgrounds"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Antecedentes
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">{data.name}</h1>
      </div>

      <dl className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
        {data.abilityOptionNames?.length ? (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-muted-foreground">
              Bônus de atributo
            </dt>
            <dd>{data.abilityOptionNames.join(", ")}</dd>
          </div>
        ) : null}
        {data.equipmentGoldOption != null ? (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              Ouro (opção)
            </dt>
            <dd>{data.equipmentGoldOption} PO</dd>
          </div>
        ) : null}
        {data.originFeatName || data.originFeatSlug ? (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-muted-foreground">
              Talento de origem
            </dt>
            <dd>{data.originFeatName ?? data.originFeatSlug}</dd>
          </div>
        ) : null}
        {(skills.data?.data.length ?? 0) > 0 ? (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-muted-foreground">
              Perícias
            </dt>
            <dd>{skills.data!.data.map((s) => s.name).join(", ")}</dd>
          </div>
        ) : null}
        {data.toolProficiencyKind === "fixed" &&
        (data.toolItemName || data.toolItemSlug) ? (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-muted-foreground">
              Ferramenta
            </dt>
            <dd>{data.toolItemName ?? data.toolItemSlug}</dd>
          </div>
        ) : null}
        {data.toolProficiencyKind === "choice" ? (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-muted-foreground">
              Ferramenta (escolha)
            </dt>
            <dd>
              {data.toolProficiencyDescription ? (
                <p className="mb-2 text-sm text-muted-foreground">
                  {data.toolProficiencyDescription}
                </p>
              ) : null}
              {(tools.data?.data.length ?? 0) > 0 ? (
                <ul className="list-inside list-disc text-sm">
                  {tools.data!.data.map((tool) => (
                    <li key={tool.itemSlug}>{tool.itemName}</li>
                  ))}
                </ul>
              ) : tools.isPending ? (
                "Carregando opções…"
              ) : (
                "—"
              )}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

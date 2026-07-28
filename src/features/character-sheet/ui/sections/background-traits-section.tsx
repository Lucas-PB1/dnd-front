"use client";

import {
  useBackgroundDetail,
  useBackgroundTools,
} from "@/features/background-catalog/api/use-backgrounds";
import type { SheetReadSectionProps } from "@/features/character-sheet/ui/sections/sheet-section-types";
import { SheetChip } from "@/features/character-sheet/ui/sheet/sheet-ui";
import { Button } from "@/shared/ui/button";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";

export function BackgroundTraitsSection({
  character,
  labels,
  onEditTool,
}: SheetReadSectionProps & { onEditTool?: () => void }) {
  const backgroundDetail = useBackgroundDetail(character.backgroundSlug, true);
  const backgroundTools = useBackgroundTools(
    character.backgroundSlug,
    backgroundDetail.data?.toolProficiencyKind === "choice",
  );

  if (backgroundDetail.isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando antecedente…</p>
    );
  }

  const bg = backgroundDetail.data;
  const originFeat =
    bg?.originFeatName ??
    (bg?.originFeatSlug ? labels.resolveFeat(bg.originFeatSlug) : null);
  const toolSlug = character.backgroundToolItemSlug ?? bg?.toolItemSlug ?? null;
  const toolName =
    bg?.toolProficiencyKind === "fixed"
      ? (bg.toolItemName ?? toolSlug)
      : toolSlug
        ? (backgroundTools.data?.data.find((t) => t.itemSlug === toolSlug)
            ?.itemName ?? toolSlug)
        : null;
  const backgroundSkills =
    character.backgroundSkillSlugs.length > 0
      ? character.backgroundSkillSlugs.map((slug) => labels.resolveSkill(slug))
      : [];

  if (
    !bg?.description &&
    !originFeat &&
    !toolName &&
    backgroundSkills.length === 0 &&
    bg?.toolProficiencyKind !== "choice"
  ) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum traço de antecedente registrado.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Toque em um item para ver detalhes.
      </p>
      <div className="space-y-1.5">
        {bg?.description ? (
          <CollapsibleCard
            title="Sobre o antecedente"
            size="compact"
            defaultOpen={false}
            className="bg-background/50"
          >
            <PhbProse text={bg.description} />
          </CollapsibleCard>
        ) : null}
        {originFeat ? (
          <CollapsibleCard
            title="Talento de origem"
            subtitle={originFeat}
            size="compact"
            defaultOpen={false}
            className="bg-background/50"
          >
            <p className="text-sm text-muted-foreground">
              Talento concedido pelo antecedente:{" "}
              <span className="font-medium text-foreground">{originFeat}</span>
            </p>
          </CollapsibleCard>
        ) : null}
        {backgroundSkills.length > 0 ? (
          <CollapsibleCard
            title="Perícias"
            subtitle={`${backgroundSkills.length} perícia${backgroundSkills.length > 1 ? "s" : ""}`}
            size="compact"
            defaultOpen
            className="bg-background/50"
          >
            <ul className="flex flex-wrap gap-1.5">
              {backgroundSkills.map((name) => (
                <li key={name}>
                  <SheetChip active>{name}</SheetChip>
                </li>
              ))}
            </ul>
          </CollapsibleCard>
        ) : null}
        {toolName || bg?.toolProficiencyKind === "choice" ? (
          <CollapsibleCard
            title="Ferramenta"
            subtitle={toolName ?? "Escolher"}
            size="compact"
            defaultOpen
            className="bg-background/50"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{toolName ?? "—"}</p>
              {bg?.toolProficiencyKind === "choice" && onEditTool ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-xs"
                  onClick={onEditTool}
                >
                  Editar
                </Button>
              ) : null}
            </div>
          </CollapsibleCard>
        ) : null}
      </div>
    </div>
  );
}

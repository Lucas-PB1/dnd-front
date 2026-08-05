"use client";

import { useMemo } from "react";

import {
  useBackgroundDetail,
  useBackgroundTools,
} from "@/features/catalog/background-catalog/api/use-backgrounds";
import {
  DetailTileGrid,
  type DetailTileItem,
} from "@/features/character/character-sheet/ui/sections/detail-tile-grid";
import type { SheetReadSectionProps } from "@/features/character/character-sheet/ui/sections/sheet-section-types";
import { SheetChip } from "@/features/character/character-sheet/ui/sheet/sheet-ui";
import { Button } from "@/shared/ui/button";
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

  const items = useMemo((): DetailTileItem[] => {
    const next: DetailTileItem[] = [];
    if (bg?.description) {
      next.push({
        id: "about",
        title: "Sobre o antecedente",
        body: <PhbProse text={bg.description} />,
      });
    }
    if (originFeat) {
      next.push({
        id: "origin-feat",
        title: "Talento de origem",
        subtitle: originFeat,
        body: (
          <p className="text-sm text-muted-foreground">
            Talento concedido pelo antecedente:{" "}
            <span className="font-medium text-foreground">{originFeat}</span>
          </p>
        ),
      });
    }
    if (backgroundSkills.length > 0) {
      next.push({
        id: "skills",
        title: "Perícias",
        subtitle: `${backgroundSkills.length} perícia${backgroundSkills.length > 1 ? "s" : ""}`,
        body: (
          <ul className="flex flex-wrap gap-1.5">
            {backgroundSkills.map((name) => (
              <li key={name}>
                <SheetChip active>{name}</SheetChip>
              </li>
            ))}
          </ul>
        ),
      });
    }
    if (toolName || bg?.toolProficiencyKind === "choice") {
      next.push({
        id: "tool",
        title: "Ferramenta",
        subtitle: toolName ?? "Escolher",
        accent: bg?.toolProficiencyKind === "choice",
        body: (
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
        ),
      });
    }
    return next;
  }, [backgroundSkills, bg, onEditTool, originFeat, toolName]);

  if (backgroundDetail.isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando antecedente…</p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum traço de antecedente registrado.
      </p>
    );
  }

  return (
    <DetailTileGrid
      items={items}
      hint="Toque em um item para ver detalhes."
    />
  );
}

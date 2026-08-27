"use client";

import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useState, type ReactNode } from "react";

import { FeatureDetailDialog } from "@/features/character/character-sheet/ui/sheet/feature-detail-dialog";
import { PhbProse } from "@/shared/ui/phb-prose";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type ChoicePreviewPanelProps = {
  title: string;
  subtitle?: string;
  /** Texto curto sob o select (1–4 linhas). */
  teaser?: string | null;
  /**
   * Texto completo do modal ℹ.
   * Se omitido, o modal usa o teaser.
   */
  detailText?: string | null;
  /** Conteúdo extra no modal (listas, etc.). */
  detailBody?: ReactNode;
  loading?: boolean;
  className?: string;
};

/**
 * Prévia híbrida do create-character: teaser sob o controle + ℹ para detalhe.
 */
export function ChoicePreviewPanel({
  title,
  subtitle,
  teaser,
  detailText,
  detailBody,
  loading = false,
  className,
}: ChoicePreviewPanelProps) {
  const [open, setOpen] = useState(false);
  const teaserTrim = teaser?.trim() ?? "";
  const detailTrim = (detailText?.trim() || teaserTrim).trim();
  const canOpenDetail = Boolean(detailTrim || detailBody);

  if (loading) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        Carregando prévia…
      </p>
    );
  }

  if (!teaserTrim && !canOpenDetail) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-1.5 rounded-md border border-border/50 bg-muted/15 px-2.5 py-2",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        {subtitle ? (
          <p className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
            {subtitle}
          </p>
        ) : null}
        {teaserTrim ? (
          <PhbProse
            text={teaserTrim}
            className="text-xs leading-snug text-muted-foreground [&_p]:my-0"
          />
        ) : (
          <p className="text-xs text-muted-foreground">{title}</p>
        )}
      </div>
      {canOpenDetail ? (
        <>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            className="mt-0.5 size-7 shrink-0 p-0 text-muted-foreground"
            aria-label={`Ver detalhe de ${title}`}
            title={`Ver detalhe: ${title}`}
            onClick={() => setOpen(true)}
          >
            <InformationCircleIcon className="size-4" aria-hidden />
          </Button>
          <FeatureDetailDialog
            open={open}
            onOpenChange={setOpen}
            title={title}
            subtitle={subtitle}
          >
            {detailTrim ? <PhbProse text={detailTrim} /> : null}
            {detailBody}
          </FeatureDetailDialog>
        </>
      ) : null}
    </div>
  );
}

/** Junta benefits de feat em um teaser + corpo de dialog. */
export function formatFeatBenefitsTeaser(
  benefits: Array<{ name?: string | null; description?: string | null }>,
  maxChars = 220,
): { teaser: string; detail: string } {
  const lines = benefits
    .map((benefit) => {
      const name = benefit.name?.trim();
      const description = benefit.description?.trim();
      if (name && description) return `${name}: ${description}`;
      return description || name || "";
    })
    .filter(Boolean);
  const detail = lines.join("\n\n");
  const teaser =
    detail.length <= maxChars
      ? detail
      : `${detail.slice(0, maxChars).trim()}…`;
  return { teaser, detail };
}

/** Hint curto para SearchableSelect (benefit truncado). */
export function truncateChoiceHint(
  text: string | null | undefined,
  maxChars = 72,
): string | undefined {
  const trimmed = text?.trim();
  if (!trimmed) return undefined;
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars).trim()}…`;
}

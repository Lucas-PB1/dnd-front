"use client";

import Link from "next/link";

import type { FeatSummary } from "@/entities/feat/types";
import {
  formatFeatStructuredPrerequisites,
  hasStructuredFeatPrerequisites,
  type FeatPrerequisiteLabels,
} from "@/features/catalog/feat-catalog/lib/format-feat-prerequisites";

type FeatPrerequisitesBlockProps = {
  feat: Pick<FeatSummary, "prerequisite" | "requiredFeatSlugs"> &
    Parameters<typeof formatFeatStructuredPrerequisites>[0];
  originBackgrounds?: { slug: string; name: string }[];
  labels?: FeatPrerequisiteLabels;
  className?: string;
};

export function FeatPrerequisitesBlock({
  feat,
  originBackgrounds = [],
  labels,
  className,
}: FeatPrerequisitesBlockProps) {
  const structured = formatFeatStructuredPrerequisites(feat, labels);
  const hasText = Boolean(feat.prerequisite?.trim());
  const hasStructured = structured.length > 0;
  const hasFeatLinks = feat.requiredFeatSlugs.length > 0;
  const hasBackgrounds = originBackgrounds.length > 0;

  if (!hasText && !hasStructured && !hasFeatLinks && !hasBackgrounds) {
    return null;
  }

  return (
    <div className={className}>
      <p className="text-xs font-medium tracking-wider text-primary uppercase">
        Pré-requisitos
      </p>
      <div className="mt-2 space-y-2 text-sm text-foreground/90">
        {hasText ? (
          <p>
            <span className="font-medium text-foreground">Texto:</span>{" "}
            {feat.prerequisite}
          </p>
        ) : null}
        {hasStructured || hasFeatLinks ? (
          <ul className="list-inside list-disc space-y-1">
            {structured.map((line) => (
              <li key={line}>{line}</li>
            ))}
            {feat.requiredFeatSlugs.map((slug) => (
              <li key={`feat-link-${slug}`}>
                Talento:{" "}
                <Link
                  href={`/feats/${slug}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {labels?.featLabels?.[slug] ?? slug}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        {hasBackgrounds ? (
          <div>
            <p className="font-medium text-foreground">
              Concedido por antecedente
            </p>
            <ul className="mt-1 list-inside list-disc space-y-1">
              {originBackgrounds.map((background) => (
                <li key={background.slug}>
                  <Link
                    href={`/backgrounds/${background.slug}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {background.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function featHasPrerequisiteContent(
  feat: Parameters<typeof hasStructuredFeatPrerequisites>[0] & {
    prerequisite?: string | null;
  },
  originBackgrounds: { slug: string; name: string }[] = [],
): boolean {
  return (
    Boolean(feat.prerequisite?.trim()) ||
    hasStructuredFeatPrerequisites(feat) ||
    originBackgrounds.length > 0
  );
}

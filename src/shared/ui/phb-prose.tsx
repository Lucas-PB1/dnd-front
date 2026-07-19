"use client";

import Link from "next/link";

import { parsePhbText } from "@/shared/lib/parse-phb-text";
import {
  segmentCatalogText,
  type CatalogLinkEntry,
} from "@/shared/lib/segment-catalog-text";
import { appendReturnParam } from "@/shared/lib/catalog-return";
import { cn } from "@/shared/lib/utils";

type PhbProseProps = {
  text: string;
  className?: string;
  /** Catálogo para wiki-links e auto-link de nomes. */
  catalogLinks?: CatalogLinkEntry[];
  currentSlug?: string;
  /** Preserva listagem ao navegar para outro item. */
  returnTo?: string | null;
};

export function PhbProse({
  text,
  className,
  catalogLinks,
  currentSlug,
  returnTo,
}: PhbProseProps) {
  const blocks = parsePhbText(text);

  if (!blocks.length) return null;

  return (
    <div
      className={cn(
        "space-y-3 text-sm leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {blocks.map((block, index) => {
        if (block.type === "list") {
          return (
            <ul
              key={`list-${index}`}
              className="list-disc space-y-1.5 pl-5 marker:text-primary"
            >
              {block.items.map((item, itemIndex) => (
                <li
                  key={`${index}-${itemIndex}`}
                  className="pl-1 text-foreground/90"
                >
                  {renderLinkedText(item, catalogLinks, currentSlug, returnTo)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`p-${index}`} className="text-pretty">
            {renderLinkedText(block.text, catalogLinks, currentSlug, returnTo)}
          </p>
        );
      })}
    </div>
  );
}

function renderLinkedText(
  value: string,
  catalogLinks: CatalogLinkEntry[] | undefined,
  currentSlug: string | undefined,
  returnTo: string | null | undefined,
) {
  if (!catalogLinks?.length) return value;

  const segments = segmentCatalogText(value, catalogLinks, { currentSlug });
  return segments.map((segment, index) => {
    if (segment.type === "text") {
      return <span key={index}>{segment.value}</span>;
    }
    return (
      <Link
        key={index}
        href={appendReturnParam(segment.href, returnTo)}
        className="font-medium text-primary underline-offset-2 hover:underline"
      >
        {segment.label}
      </Link>
    );
  });
}

"use client";

import { useMemo, useState } from "react";

import { resolveCatalogImageUrl } from "@/shared/lib/resolve-catalog-image-url";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/design-system/primitives/dialog";
import { cn } from "@/shared/lib/utils";

type CatalogMediaImageProps = {
  src: string;
  alt?: string;
  className?: string;
  /** Abre lightbox ao clicar (detalhe de stat block, item, etc.). */
  expandable?: boolean;
};

/** Imagem de catálogo — lazy; URL resolvida via API (`/catalog/…`). */
export function CatalogMediaImage({
  src,
  alt = "",
  className,
  expandable = false,
}: CatalogMediaImageProps) {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const resolvedSrc = useMemo(() => resolveCatalogImageUrl(src), [src]);

  if (hidden || !resolvedSrc) return null;

  const image = (
    <img
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setHidden(true)}
      onClick={expandable ? () => setOpen(true) : undefined}
      onKeyDown={
        expandable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setOpen(true);
              }
            }
          : undefined
      }
      role={expandable ? "button" : undefined}
      tabIndex={expandable ? 0 : undefined}
      className={cn(
        className,
        expandable &&
          "cursor-zoom-in transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
      )}
    />
  );

  if (!expandable) return image;

  return (
    <>
      {image}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-[min(96vw,56rem)] border-0 bg-transparent p-2 shadow-none ring-0 sm:max-w-4xl"
          overlayClassName="bg-black/70 supports-backdrop-filter:backdrop-blur-sm"
        >
          <DialogTitle className="sr-only">
            {alt ? `Imagem: ${alt}` : "Imagem ampliada"}
          </DialogTitle>
          <img
            src={resolvedSrc}
            alt={alt}
            className="mx-auto max-h-[min(85vh,48rem)] w-full rounded-lg object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

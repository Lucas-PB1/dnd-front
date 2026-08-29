"use client";

import { useState } from "react";

import { cn } from "@/shared/lib/utils";

type CatalogMediaImageProps = {
  src: string;
  alt?: string;
  className?: string;
};

/** Imagem de catálogo — lazy, some se o arquivo não existir (ex.: montarias sem PNG no public). */
export function CatalogMediaImage({
  src,
  alt = "",
  className,
}: CatalogMediaImageProps) {
  const [hidden, setHidden] = useState(false);
  if (hidden || !src.trim()) return null;

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setHidden(true)}
      className={cn(className)}
    />
  );
}

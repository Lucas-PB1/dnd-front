"use client";

import { useSearchParams } from "next/navigation";

import { readReturnParam } from "@/shared/lib/catalog-return";

export function useCatalogBackHref(fallback: string) {
  const searchParams = useSearchParams();
  return readReturnParam(searchParams, fallback);
}

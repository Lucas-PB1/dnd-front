"use client";

import { useEffect } from "react";

/** Se a URL aponta para página sem itens, volta à primeira. */
export function useClampCatalogPage(
  outOfRange: boolean,
  setPage: (page: number) => void,
) {
  useEffect(() => {
    if (outOfRange) setPage(1);
  }, [outOfRange, setPage]);
}

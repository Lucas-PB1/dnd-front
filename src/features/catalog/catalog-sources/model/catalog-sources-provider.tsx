"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";

import {
  editionsKeys,
  fetchEditions,
  type Edition,
} from "@/entities/edition/api";
import {
  CATALOG_SOURCES_STORAGE_KEY,
  editionSlugsQueryParam,
  isEditionAllowed,
  readStoredEnabledEditions,
  writeStoredEnabledEditions,
} from "@/entities/edition/catalog-sources";

type CatalogSourcesContextValue = {
  editions: Edition[];
  editionsPending: boolean;
  enabledSlugs: ReadonlySet<string>;
  /** CSV para `?editionSlugs=` — undefined = todas. */
  editionSlugsParam: string | undefined;
  isEnabled: (editionSlug: string | null | undefined) => boolean;
  setEnabled: (slug: string, enabled: boolean) => void;
};

const CatalogSourcesContext = createContext<CatalogSourcesContextValue | null>(
  null,
);

type StoreListener = () => void;

let storedSnapshot: string[] | null | undefined;
const listeners = new Set<StoreListener>();

function getStoredSnapshot(): string[] | null {
  if (storedSnapshot === undefined) {
    storedSnapshot = readStoredEnabledEditions();
  }
  return storedSnapshot;
}

function subscribeStored(listener: StoreListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setStoredSnapshot(slugs: string[] | null) {
  storedSnapshot = slugs;
  if (slugs) writeStoredEnabledEditions(slugs);
  else if (typeof window !== "undefined") {
    window.localStorage.removeItem(CATALOG_SOURCES_STORAGE_KEY);
  }
  listeners.forEach((listener) => listener());
}

function useStoredEnabledSlugs(): string[] | null {
  return useSyncExternalStore(
    subscribeStored,
    getStoredSnapshot,
    () => null,
  );
}

export function CatalogSourcesProvider({ children }: { children: ReactNode }) {
  const editionsQuery = useQuery({
    queryKey: editionsKeys.all,
    queryFn: fetchEditions,
    staleTime: 60_000 * 30,
  });
  const stored = useStoredEnabledSlugs();

  const editionsData = editionsQuery.data;
  const editions = useMemo(() => editionsData ?? [], [editionsData]);
  const availableSlugs = useMemo(
    () => editions.map((edition) => edition.slug),
    [editions],
  );

  const enabledSlugs = useMemo(() => {
    if (availableSlugs.length === 0) {
      return new Set(stored ?? []);
    }
    if (!stored) {
      return new Set(availableSlugs);
    }
    const intersection = stored.filter((slug) => availableSlugs.includes(slug));
    if (intersection.length === 0) {
      return new Set(availableSlugs);
    }
    return new Set(intersection);
  }, [availableSlugs, stored]);

  const setEnabled = useCallback(
    (slug: string, enabled: boolean) => {
      const next = new Set(enabledSlugs);
      if (enabled) {
        next.add(slug);
      } else {
        if (next.size <= 1) return;
        next.delete(slug);
      }
      setStoredSnapshot([...next]);
    },
    [enabledSlugs],
  );

  const value = useMemo<CatalogSourcesContextValue>(
    () => ({
      editions,
      editionsPending: editionsQuery.isPending,
      enabledSlugs,
      editionSlugsParam: editionSlugsQueryParam(enabledSlugs, availableSlugs),
      isEnabled: (editionSlug) => isEditionAllowed(editionSlug, enabledSlugs),
      setEnabled,
    }),
    [
      editions,
      editionsQuery.isPending,
      enabledSlugs,
      availableSlugs,
      setEnabled,
    ],
  );

  return (
    <CatalogSourcesContext.Provider value={value}>
      {children}
    </CatalogSourcesContext.Provider>
  );
}

export function useCatalogSources(): CatalogSourcesContextValue {
  const ctx = useContext(CatalogSourcesContext);
  if (!ctx) {
    throw new Error("useCatalogSources must be used within CatalogSourcesProvider");
  }
  return ctx;
}

/** Seguro fora do provider (ex.: testes) — sem filtro. */
export function useCatalogSourcesOptional(): CatalogSourcesContextValue | null {
  return useContext(CatalogSourcesContext);
}

"use client";

import { useDndApiHealth } from "@/widgets/system-status/api/use-dnd-api-health";

export function DndApiStatus() {
  const { data, isPending, isError, error } = useDndApiHealth();

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Verificando dnd-api…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        dnd-api: {error instanceof Error ? error.message : "indisponível"}
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      dnd-api: <span className="text-foreground">{data?.status ?? "ok"}</span>
      {data?.db ? (
        <>
          {" "}
          · DB: <span className="text-foreground">{data.db}</span>
        </>
      ) : null}
    </p>
  );
}

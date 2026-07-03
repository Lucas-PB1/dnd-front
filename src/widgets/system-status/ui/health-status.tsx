"use client";

import { useHealth } from "@/widgets/system-status/api/use-health";

export function HealthStatus() {
  const { data, isPending, isError } = useHealth();

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Verificando API…</p>;
  }

  if (isError || !data) {
    return <p className="text-sm text-destructive">API indisponível</p>;
  }

  return (
    <p className="text-sm text-muted-foreground">
      API: <span className="text-foreground">{data.status}</span> · DB:{" "}
      <span className="text-foreground">{data.database}</span>
    </p>
  );
}

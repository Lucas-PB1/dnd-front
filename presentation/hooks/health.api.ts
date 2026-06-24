import type { HealthResponse } from "@/application/health/health.schema";

export const healthKeys = {
  all: ["health"] as const,
};

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch("/api/health");

  if (!response.ok) {
    throw new Error("Falha ao consultar /api/health");
  }

  return response.json();
}

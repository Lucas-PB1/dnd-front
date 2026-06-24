import { describe, expect, it } from "vitest";

import { toHealthResponse } from "@/application/health/health.schema";
import { getHealthStatus } from "@/application/health/get-health-status";
import type { HealthRepository } from "@/domain/health/health-repository";

describe("toHealthResponse", () => {
  it("serializa resposta de health válida", () => {
    const response = toHealthResponse({
      status: "ok",
      timestamp: new Date("2026-06-24T12:00:00.000Z"),
      database: "ok",
    });

    expect(response).toEqual({
      status: "ok",
      timestamp: "2026-06-24T12:00:00.000Z",
      database: "ok",
    });
  });
});

describe("getHealthStatus", () => {
  it("delega ao repositório", async () => {
    const repository: HealthRepository = {
      check: async () => ({
        status: "degraded",
        timestamp: new Date("2026-06-24T12:00:00.000Z"),
        database: "degraded",
      }),
    };

    const health = await getHealthStatus(repository);

    expect(health.status).toBe("degraded");
    expect(health.database).toBe("degraded");
  });
});

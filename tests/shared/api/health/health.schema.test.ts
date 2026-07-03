import { describe, expect, it } from "vitest";

import { toHealthResponse } from "@/shared/api/health/health.schema";

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

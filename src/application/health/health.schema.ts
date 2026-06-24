import { z } from "zod";

const healthStatusValueSchema = z.enum(["ok", "degraded"]);

export const healthResponseSchema = z.object({
  status: healthStatusValueSchema,
  timestamp: z.iso.datetime(),
  database: healthStatusValueSchema,
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export function toHealthResponse(health: {
  status: "ok" | "degraded";
  timestamp: Date;
  database: "ok" | "degraded";
}): HealthResponse {
  return healthResponseSchema.parse({
    status: health.status,
    timestamp: health.timestamp.toISOString(),
    database: health.database,
  });
}

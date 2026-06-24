import { getHealthStatus } from "@/application/health/get-health-status";
import { toHealthResponse } from "@/application/health/health.schema";
import { healthRepository } from "@/infrastructure/di";

export async function GET() {
  const health = await getHealthStatus(healthRepository);

  return Response.json(toHealthResponse(health));
}

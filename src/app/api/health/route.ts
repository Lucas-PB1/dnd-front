import { checkHealth } from "@/shared/api/health/check-health";
import { toHealthResponse } from "@/shared/api/health/health.schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await checkHealth();
  return Response.json(toHealthResponse(health));
}

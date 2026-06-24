import type { HealthRepository } from "@/domain/health/health-repository";
import type { HealthStatus } from "@/domain/health/health-status";

export class StaticHealthRepository implements HealthRepository {
  async check(): Promise<HealthStatus> {
    return {
      status: "ok",
      timestamp: new Date(),
      database: "degraded",
    };
  }
}

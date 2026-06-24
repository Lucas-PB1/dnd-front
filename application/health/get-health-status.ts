import type { HealthRepository } from "@/domain/health/health-repository";
import type { HealthStatus } from "@/domain/health/health-status";

export async function getHealthStatus(
  repository: HealthRepository,
): Promise<HealthStatus> {
  return repository.check();
}

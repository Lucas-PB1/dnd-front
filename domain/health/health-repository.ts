import type { HealthStatus } from "./health-status";

export interface HealthRepository {
  check(): Promise<HealthStatus>;
}

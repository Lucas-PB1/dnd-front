export type HealthStatusValue = "ok" | "degraded";

export type HealthStatus = {
  status: HealthStatusValue;
  timestamp: Date;
  database: HealthStatusValue;
};

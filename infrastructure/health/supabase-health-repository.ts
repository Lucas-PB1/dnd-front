import type { HealthRepository } from "@/domain/health/health-repository";
import type { HealthStatus } from "@/domain/health/health-status";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export class SupabaseHealthRepository implements HealthRepository {
  async check(): Promise<HealthStatus> {
    const timestamp = new Date();

    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.getSession();

      if (error) {
        return { status: "degraded", timestamp, database: "degraded" };
      }

      return { status: "ok", timestamp, database: "ok" };
    } catch {
      return { status: "degraded", timestamp, database: "degraded" };
    }
  }
}

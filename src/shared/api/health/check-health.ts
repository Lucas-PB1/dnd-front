import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import { isSupabaseConfigured } from "@/shared/api/supabase/env";
import type { HealthStatus } from "@/shared/api/health/types";

export async function checkHealth(): Promise<HealthStatus> {
  const timestamp = new Date();

  if (!isSupabaseConfigured()) {
    return { status: "ok", timestamp, database: "degraded" };
  }

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

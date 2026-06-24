import { StaticHealthRepository } from "@/infrastructure/health/static-health-repository";
import { SupabaseHealthRepository } from "@/infrastructure/health/supabase-health-repository";
import { isSupabaseConfigured } from "@/infrastructure/supabase/env";

export const healthRepository = isSupabaseConfigured()
  ? new SupabaseHealthRepository()
  : new StaticHealthRepository();

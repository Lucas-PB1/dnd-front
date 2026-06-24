import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "@/infrastructure/supabase/env";

import type { Database } from "@/infrastructure/supabase/database";

export function createSupabaseBrowserClient() {
  const env = getSupabaseEnv();

  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

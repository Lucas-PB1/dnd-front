# Supabase — health no front

Health local não usa `di.ts` / repositórios antigos. Fluxo atual:

```typescript
// shared/api/health/check-health.ts
export async function checkHealth(): Promise<HealthStatus> {
  if (!isSupabaseConfigured()) {
    return { status: "ok", timestamp, database: "degraded" };
  }
  const supabase = await createSupabaseServerClient();
  // getSession — degraded se falhar
}
```

Route: `app/api/health` → `checkHealth()` → JSON.

Auth de jogo: JWT Supabase enviado pelo front; validação na **dnd-api** (`SupabaseAuthGuard`).

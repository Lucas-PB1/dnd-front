# Supabase — health adapter

```typescript
// infrastructure/health/supabase-health-repository.ts
export class SupabaseHealthRepository implements HealthRepository {
  async check(): Promise<HealthStatus> {
    const client = await createSupabaseServerClient();
    // ...
  }
}
```

Fallback quando env ausente: `StaticHealthRepository` em `di.ts`.

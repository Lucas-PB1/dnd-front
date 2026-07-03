# SOLID — wiring (di.ts)

```typescript
// src/infrastructure/di.ts
export const healthRepository = isSupabaseConfigured()
  ? new SupabaseHealthRepository()
  : new StaticHealthRepository();
```

`application` recebe `HealthRepository` por parâmetro — não conhece implementação concreta.

## Violação DIP

```typescript
// BAD em application/
import { createSupabaseServerClient } from "@/shared/api/supabase/server";

// GOOD — port injetado
export async function getHealthStatus(repository: HealthRepository) { ... }
```

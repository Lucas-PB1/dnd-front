# TypeScript — exemplos (health)

## Port (domain)

```typescript
// src/domain/health/health-repository.ts
export interface HealthRepository {
  check(): Promise<HealthStatus>;
}
```

## Use case (application)

```typescript
// src/application/health/get-health-status.ts
export async function getHealthStatus(
  repository: HealthRepository,
): Promise<HealthStatus> {
  return repository.check();
}
```

## Schema + infer

```typescript
// src/application/health/health.schema.ts
export type HealthResponse = z.infer<typeof healthResponseSchema>;
```

## Evitar

```typescript
// BAD
const data = (await res.json()) as HealthResponse;

// GOOD
const data = healthResponseSchema.parse(await res.json());
```

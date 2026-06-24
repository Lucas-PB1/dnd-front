# Clean Code — anti-patterns

## Função faz demais na route

```typescript
// BAD — lógica + fetch + parse na route
export async function GET() {
  const client = createClient(...);
  const { error } = await client.auth.getSession();
  // ... 20 linhas
}

// GOOD — delega ao use case + repo
export async function GET() {
  const health = await getHealthStatus(healthRepository);
  return Response.json(toHealthResponse(health));
}
```

## Nome vago

```typescript
// BAD
async function handle() { ... }

// GOOD
async function getHealthStatus(repository: HealthRepository) { ... }
```

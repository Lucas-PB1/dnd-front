---
name: testing-vitest
description: Vitest unit tests for dnd — application, domain, schemas. Use when writing *.test.ts files or mocking repository ports.
disable-model-invocation: true
---

# Vitest — unitários

## Comandos

`pnpm test` (watch) · `pnpm test:run` (CI)

## Onde testar

- `application/` — use cases com mock de port
- `*.schema.ts` — validação Zod
- `domain/` — lógica pura

## Exemplo

`src/application/health/health.schema.test.ts`

## Mock de port

```typescript
const mockRepo: HealthRepository = {
  check: vi.fn().mockResolvedValue({ status: "ok", database: "connected" }),
};
await getHealthStatus(mockRepo);
```

## Evitar

Supabase real, fetch de rede em unitários.

Config: `vitest.config.ts`

---
name: dnd-architecture
description: Clean Architecture for the dnd Next.js project. Use when creating features, domain entities, use cases, repository ports, infrastructure adapters, or deciding where code belongs in src/domain, src/application, src/infrastructure.
disable-model-invocation: true
---

# Clean Architecture — dnd

## Estrutura

```text
src/app/              → rotas finas (presentation entry)
src/domain/           → entidades, tipos, ports (interfaces)
src/application/      → use cases, schemas Zod de API
src/infrastructure/   → Supabase, repos, di.ts
src/presentation/     → componentes, hooks, providers
src/components/ui/    → shadcn
src/lib/              → utils transversais
```

## Nova feature (ex.: campaigns)

1. `domain/campaigns/` — `Campaign`, `CampaignRepository` interface
2. `application/campaigns/` — `createCampaign()`, `campaign.schema.ts`
3. `infrastructure/campaigns/` — `SupabaseCampaignRepository`
4. Registrar em `infrastructure/di.ts`
5. `app/api/campaigns/route.ts` — Zod → use case → JSON
6. `presentation/` — hooks e componentes

## Exemplo existente: health

```text
GET /api/health
  → getHealthStatus(healthRepository)     [application]
  → HealthRepository.check()              [domain port]
  → SupabaseHealthRepository              [infrastructure]
```

## Regras de import

- `domain/` → nada de React, Supabase, Next
- `application/` → só `domain/`
- `infrastructure/` → `domain/` + libs externas
- `app/api/` → `application/` + `infrastructure/di`

Detalhes: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

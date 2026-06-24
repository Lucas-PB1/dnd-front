---
name: solid
description: SOLID principles applied to dnd Clean Architecture. Use when refactoring coupling, responsibilities, ports, adapters, or use case boundaries. Complements rule 03-solid.
disable-model-invocation: true
---

# SOLID — dnd

## SRP

| Camada             | Responsabilidade                        |
| ------------------ | --------------------------------------- |
| `app/api/route.ts` | HTTP: parse, chamar use case, responder |
| `application/`     | Orquestração de regra de negócio        |
| `infrastructure/`  | Acesso a Supabase, DI                   |
| `domain/`          | Tipos e contratos                       |

## OCP

Novo storage? Novo `*Repository` em `infrastructure/` — não editar interface sem necessidade.

## LSP

`healthRepository` em `di.ts` pode ser `StaticHealthRepository` ou `SupabaseHealthRepository` — mesma interface.

## ISP

Ports focados: `HealthRepository` só tem `check()`, não métodos genéricos de DB.

## DIP

```typescript
// application — depende de abstração
export async function getHealthStatus(repository: HealthRepository) { ... }

// infrastructure — implementa
export class SupabaseHealthRepository implements HealthRepository { ... }
```

`application/` **nunca** importa `@supabase/supabase-js`.

Ver [reference.md](reference.md).

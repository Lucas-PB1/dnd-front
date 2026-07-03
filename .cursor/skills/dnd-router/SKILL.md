---
name: dnd-router
description: Routes agent tasks in dnd-front to the correct skill. Use for any non-trivial coding task.
---

# dnd-front — Skill Router

Arquitetura: **Feature-Sliced Design**. Ler `fsd-architecture` antes de codar.

## Mapa intent → skill

| Tarefa                                        | Skill                                |
| --------------------------------------------- | ------------------------------------ |
| camada FSD, nova feature, onde colocar código | `fsd-architecture`                   |
| pasta, pnpm, layout `src/`                    | `dnd-infra`                          |
| contrato REST, endpoints da API               | `dnd-api-contract`                   |
| catalogFetch, gameFetch, ApiError             | `dnd-api-client`                     |
| login, signup, sessão, JWT                    | `supabase-auth`                      |
| client Supabase, env, tipos DB                | `supabase`                           |
| proxy, cookies sessão                         | `next-proxy`                         |
| página, layout, RSC                           | `next-core`                          |
| route handler `/api`                          | `next-api`                           |
| TanStack Query                                | `tanstack-query`                     |
| shadcn, UI kit                                | `ui-shadcn`                          |
| tema, dark mode                               | `ui-theme`                           |
| RHF + Zod                                     | `forms-rhf-zod`                      |
| TypeScript                                    | `typescript`                         |
| Vitest / Cypress                              | `testing-vitest` / `testing-cypress` |

## Referência — repo dnd-api

| Assunto          | Skill dnd-api            |
| ---------------- | ------------------------ |
| Módulos Nest     | `nestjs-bounded-context` |
| Catálogo vs game | `cqrs-catalog-vs-game`   |
| JWT + RLS        | `supabase-auth`          |

## Docs

[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/API-INTEGRATION.md](docs/API-INTEGRATION.md)

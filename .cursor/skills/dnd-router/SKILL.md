---
name: dnd-router
description: Routes agent tasks in the dnd project to the correct skill. Use for any non-trivial coding task in this repo — features, API, UI, Supabase, tests, refactor, architecture, or when unsure which skill applies.
---

# dnd — Skill Router

Antes de codar tarefas não triviais: identifique a skill abaixo e **leia o `SKILL.md` correspondente** em `.cursor/skills/<nome>/`.

Rules `alwaysApply` (TypeScript strict, Clean Code, SOLID, DRY) já estão ativas — não ignorar.

## Mapa intent → skill

| Se o usuário / tarefa envolve…                        | Skill              |
| ----------------------------------------------------- | ------------------ |
| nova feature, camada, domain, use case, port, adapter | `dnd-architecture` |
| pasta, script, pnpm, Husky, docs, estrutura `src/`    | `dnd-infra`        |
| TypeScript, tipos, interface, generic, strict         | `typescript`       |
| legibilidade, nomes, função grande, clean code        | `clean-code`       |
| SOLID, SRP, OCP, DIP, acoplamento, responsabilidade   | `solid`            |
| DRY, duplicação, schema repetido, extrair             | `dry`              |
| página, layout, RSC, Server Action                    | `next-core`        |
| `/api`, route handler, REST                           | `next-api`         |
| proxy, sessão, cookies auth                           | `next-proxy`       |
| Supabase, banco, migração, RLS, publishable key       | `supabase`         |
| TanStack Query, useQuery, mutation, cache             | `tanstack-query`   |
| shadcn, componente UI, field, input                   | `ui-shadcn`        |
| tema, dark mode, cores, tokens, Heroicons             | `ui-theme`         |
| formulário, RHF, zodResolver                          | `forms-rhf-zod`    |
| teste unitário, Vitest                                | `testing-vitest`   |
| E2E, Cypress                                          | `testing-cypress`  |

## Futuro (não instalado)

TanStack Table, nuqs, Sentry, next-intl — ver `docs/STACK-OPTIONS.md`

## Referência rápida

- Stack: `docs/STACK-OPTIONS.md`
- Arquitetura: `docs/ARCHITECTURE.md`
- Código em: `src/`

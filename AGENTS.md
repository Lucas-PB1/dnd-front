<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Agente dnd-front

## Skills

Roteador (ler primeiro em tarefas não triviais): [`.cursor/skills/dnd-router/SKILL.md`](.cursor/skills/dnd-router/SKILL.md)

| Grupo   | Skills                                              |
| ------- | --------------------------------------------------- |
| Projeto | `fsd-architecture`, `dnd-infra`, `dnd-api-contract` |
| Código  | `typescript`, `clean-code`, `solid`, `dry`          |
| Next.js | `next-core`, `next-api`, `next-proxy`               |
| Dados   | `supabase`, `supabase-auth`, `tanstack-query`       |
| UI      | `ui-shadcn`, `ui-theme`                             |
| Forms   | `forms-rhf-zod`                                     |
| Testes  | `testing-vitest`, `testing-cypress`                 |

Todas em `.cursor/skills/<nome>/SKILL.md`.

## Rules (sempre ativas)

`.cursor/rules/` — aplicadas em toda conversa:

- `00-project-core` — PT-BR, `src/`, stack
- `01-typescript-strict` — strict, Zod
- `02-clean-code` — legibilidade
- `03-solid` — SOLID no FSD
- `04-dry` — schemas e keys únicos

Rules por contexto (globs): `10`–`50` em `.cursor/rules/`.

## Arquitetura

**Feature-Sliced Design** em `src/`: `app` → `widgets` → `features` → `entities` → `shared`.  
Detalhes: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

API irmã: **dnd-api** (Nest). Não recriar backend de regras PHB no Next.

## Stack

Decisões: [docs/STACK-OPTIONS.md](docs/STACK-OPTIONS.md) · Integração: [docs/API-INTEGRATION.md](docs/API-INTEGRATION.md)

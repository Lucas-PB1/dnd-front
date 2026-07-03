---
name: dnd-infra
description: Repo infrastructure for dnd-front — FSD layout, pnpm, tooling.
disable-model-invocation: true
---

# Infraestrutura — dnd-front

## Layout FSD (`src/`)

| Pasta       | Conteúdo                      |
| ----------- | ----------------------------- |
| `app/`      | rotas Next + `app/providers/` |
| `widgets/`  | UI composta                   |
| `features/` | slices de produto             |
| `entities/` | tipos e dados de domínio      |
| `shared/`   | ui, api, lib                  |

## Testes (`tests/`)

Espelha FSD: `tests/entities/`, `tests/features/`, `tests/shared/`

## Scripts

`pnpm dev` · `pnpm lint` · `pnpm test:run` · `pnpm build`

Alias TS: `@/*` → `src/*`

shadcn UI: `src/shared/ui/` — ver `components.json`

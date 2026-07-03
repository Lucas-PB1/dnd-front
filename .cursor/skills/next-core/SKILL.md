---
name: next-core
description: Next.js 16 App Router for dnd-front — thin pages, RSC, metadata. Use when editing src/app pages or layouts.
disable-model-invocation: true
---

# Next.js 16 — App layer

## Estrutura FSD

- `src/app/layout.tsx` — root + `AppProviders` de `app/providers/`
- `src/app/<rota>/page.tsx` — **fino** — importa `widgets/` ou `features/`
- `src/app/api/` — Route Handlers (skill `next-api`)

## RSC vs Client

| Server (default)    | `"use client"`              |
| ------------------- | --------------------------- |
| `page.tsx` estático | hooks, eventos, formulários |
| fetch catálogo RSC  | `features/*/ui/`            |

## Regra

`app/` **não** contém lógica de negócio — só composição de slices.

## Não usar

- `middleware.ts` — usar `src/proxy.ts` (skill `next-proxy`)

Ler `node_modules/next/dist/docs/` para APIs novas do Next 16.

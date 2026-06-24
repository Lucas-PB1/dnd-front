---
name: next-core
description: Next.js 16 App Router for dnd — pages, layouts, RSC vs client components, Server Actions, metadata. Use when creating or editing src/app pages, layouts, or server/client boundaries.
disable-model-invocation: true
---

# Next.js 16 — Core (dnd)

## Antes de codar

Ler `node_modules/next/dist/docs/` — Next 16 tem breaking changes vs versões anteriores.

## Estrutura

- `src/app/layout.tsx` — root layout, `AppProviders`, `globals.css`
- `src/app/page.tsx` — páginas por rota
- `src/app/api/` — Route Handlers (ver skill `next-api`)

## RSC vs Client

| Default                                | `"use client"`                          |
| -------------------------------------- | --------------------------------------- |
| Server Components                      | Hooks, estado, eventos                  |
| `layout.tsx`, `page.tsx` sem interação | `presentation/components/*` interativos |

Providers client em `presentation/providers/` — importados no layout.

## Server Actions

```typescript
"use server";
// delegar para application/ — mesma regra das routes
```

## Metadata

`export const metadata` em layouts/pages server.

## Não usar

- `middleware.ts` — usar `src/proxy.ts` (skill `next-proxy`)

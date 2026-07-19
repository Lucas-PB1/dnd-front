# dnd-front

Frontend Next.js do produto **Taverna** — consome a API irmã [`dnd-api`](../dnd-api). Auth via Supabase; catálogo e fichas via Nest.

## Dev

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3001](http://localhost:3001). A API local deve estar em `http://localhost:3000` (`NEXT_PUBLIC_API_URL` no `.env`).

```bash
pnpm lint
pnpm test:run
pnpm build
```

## Docs

| Doc                                                            | Assunto                 |
| -------------------------------------------------------------- | ----------------------- |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)                 | Feature-Sliced Design   |
| [docs/UX-UI-PLAN.md](./docs/UX-UI-PLAN.md)                     | Plano geral UX/UI       |
| [docs/COLORS.md](./docs/COLORS.md)                             | Tema Taverna / Masmorra |
| [docs/CHARACTER-SHEET-PLAN.md](./docs/CHARACTER-SHEET-PLAN.md) | Wizard, ficha, mesa     |
| [docs/API-INTEGRATION.md](./docs/API-INTEGRATION.md)           | Contrato com dnd-api    |
| [docs/SUPABASE.md](./docs/SUPABASE.md)                         | Auth / sessão           |
| [docs/DEPLOY.md](./docs/DEPLOY.md)                             | Deploy Vercel           |

## Stack

Next.js 16 · React 19 · TanStack Query · Supabase SSR · shadcn · Tailwind 4 · Zod · Vitest

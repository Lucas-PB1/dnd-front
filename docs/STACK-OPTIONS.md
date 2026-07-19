# Stack dnd-front — decisões e status

Next.js 16 (UI) consome a API Nest no repo irmão **`dnd-api`**. Auth/sessão via Supabase no front; regras PHB e fichas na API.

---

## Decisões

| Área              | Escolha                                         | Status                         |
| ----------------- | ----------------------------------------------- | ------------------------------ |
| **Arquitetura**   | Feature-Sliced Design                           | ✅                             |
| **Backend PHB**   | **dnd-api** (NestJS)                            | ✅                             |
| **BFF mínimo**    | Route Handler só `/api/health`                  | ✅                             |
| **Data client**   | TanStack Query + `catalogFetch` / `gameFetch`   | ✅                             |
| **Tema**          | next-themes (claro / escuro / sistema)          | ✅                             |
| **Validação**     | Zod                                             | ✅                             |
| **Auth**          | Supabase SSR (`proxy.ts`) + JWT na dnd-api      | ✅                             |
| **UI**            | shadcn/ui                                       | ✅                             |
| **Ícones**        | Heroicons                                       | ✅                             |
| **Cores**         | Tema Taverna / Masmorra                         | ✅ [COLORS.md](./COLORS.md)    |
| **Testes unit.**  | Vitest + Testing Library                        | ✅                             |
| **E2E**           | Cypress                                         | ✅                             |
| **Lint / format** | ESLint + Prettier + Husky                       | ✅                             |

**Ambiente local:** `.env.local` com Supabase + URL da dnd-api.

---

## O que está no repo

```text
src/          → app, widgets, features, entities, shared, proxy.ts
cypress/      → E2E
docs/         → documentação
tests/        → espelha FSD (entities, features, shared)
public/       → assets estáticos
```

| Item           | Onde                                                              |
| -------------- | ----------------------------------------------------------------- |
| Providers      | `src/app/providers/`                                              |
| TanStack Query | `features/*/api/`, `widgets/*/api/`, `shared/lib/query-client.ts` |
| Forms          | RHF + Zod + shadcn em `shared/ui/`                                |
| FSD            | `features/`, `entities/`, `widgets/`, `shared/`                   |
| Supabase       | `shared/api/supabase/`, `features/auth/`, `proxy.ts`              |
| dnd-api client | `shared/api/dnd-api/`                                             |
| Health         | `shared/api/health/` + `app/api/health`                           |

Docs: [ARCHITECTURE.md](./ARCHITECTURE.md) · [API-INTEGRATION.md](./API-INTEGRATION.md) · [SUPABASE.md](./SUPABASE.md) · [COLORS.md](./COLORS.md)

---

## Recomendado depois (não instalado)

| Lib                 | Para quê                         | Prioridade           |
| ------------------- | -------------------------------- | -------------------- |
| **TanStack Table**  | Listas (personagens, inventário) | Média                |
| **nuqs**            | Filtros/tabs na URL              | Média                |
| **shadcn `dialog`** | Modais                           | Média                |
| **Sentry**          | Erros em produção                | Baixa (pré-deploy)   |
| **next-intl**       | i18n                             | Só se precisar PT/EN |

---

## Scripts

| Comando                        | Função    |
| ------------------------------ | --------- |
| `pnpm dev` / `build` / `start` | Next.js   |
| `pnpm lint` / `format:check`   | Qualidade |
| `pnpm test:run`                | Vitest    |
| `pnpm test:e2e`                | Cypress   |

Pre-commit: ESLint fix + Prettier nos arquivos staged.

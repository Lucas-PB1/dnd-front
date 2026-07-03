# Stack dnd — decisões e status

Next.js 16 fullstack. Backend no próprio Next (sem .NET).

---

## Decisões

| Área              | Escolha                                   | Status                         |
| ----------------- | ----------------------------------------- | ------------------------------ |
| **Arquitetura**   | Feature-Sliced Design                     | ✅                             |
| **Backend**       | Híbrido — Route Handlers + Server Actions | ✅ base (`/api/health`)        |
| **Data client**   | TanStack Query                            | ✅                             |
| **Tema**          | next-themes (claro / escuro / sistema)    | ✅                             |
| **Validação**     | Zod                                       | ✅                             |
| **Banco**         | Supabase (publishable key)                | ✅ código — falta `.env.local` |
| **UI**            | shadcn/ui                                 | ✅ init + `button`             |
| **Ícones**        | Heroicons                                 | ✅                             |
| **Cores**         | Tema Taverna / Masmorra                   | ✅ [COLORS.md](./COLORS.md)    |
| **Proxy**         | `proxy.ts` (Next 16)                      | ✅ sessão Supabase             |
| **Testes unit.**  | Vitest + Testing Library                  | ✅                             |
| **E2E**           | Cypress                                   | ✅                             |
| **Lint / format** | ESLint + Prettier + Husky                 | ✅                             |

**Falta só no seu ambiente:** `.env.local` com publishable key do Supabase.

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

Docs: [ARCHITECTURE.md](./ARCHITECTURE.md) · [SUPABASE.md](./SUPABASE.md) · [COLORS.md](./COLORS.md)

---

## Recomendado depois (não instalado)

| Lib                 | Para quê                         | Prioridade           |
| ------------------- | -------------------------------- | -------------------- |
| **TanStack Table**  | Listas (personagens, inventário) | Média                |
| **nuqs**            | Filtros/tabs na URL              | Média                |
| **shadcn `dialog`** | Modais                           | Média                |
| **Sentry**          | Erros em produção                | Baixa (pré-deploy)   |
| **next-intl**       | i18n                             | Só se precisar PT/EN |

Já incluso indiretamente: `cn()` (`clsx` + `tailwind-merge` em `lib/utils.ts`).

---

## Scripts

| Comando                        | Função    |
| ------------------------------ | --------- |
| `pnpm dev` / `build` / `start` | Next.js   |
| `pnpm lint` / `format:check`   | Qualidade |
| `pnpm test:run`                | Vitest    |
| `pnpm test:e2e`                | Cypress   |

Pre-commit: ESLint fix + Prettier nos arquivos staged.

# Stack dnd — decisões e status

Next.js 16 fullstack. Backend no próprio Next (sem .NET).

---

## Decisões

| Área              | Escolha                                   | Status                         |
| ----------------- | ----------------------------------------- | ------------------------------ |
| **Arquitetura**   | Clean Architecture                        | ✅                             |
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

| Item               | Onde                                                   |
| ------------------ | ------------------------------------------------------ |
| Providers          | `presentation/providers/` (Theme + Query)              |
| TanStack Query     | `useHealth`, `lib/query-client.ts`                     |
| Tema escuro        | `ThemeToggle`, `next-themes` + tokens em `globals.css` |
| Clean Architecture | `domain/`, `application/`, `infrastructure/`           |
| Supabase           | `infrastructure/supabase/`, `proxy.ts`                 |

Docs: [ARCHITECTURE.md](./ARCHITECTURE.md) · [SUPABASE.md](./SUPABASE.md) · [COLORS.md](./COLORS.md)

---

## Recomendado depois (não instalado)

| Lib                                  | Para quê                         | Prioridade           |
| ------------------------------------ | -------------------------------- | -------------------- |
| **React Hook Form + Zod**            | Formulários de ficha/campanha    | Alta                 |
| **shadcn `form`, `input`, `dialog`** | UI dos forms                     | Alta                 |
| **TanStack Table**                   | Listas (personagens, inventário) | Média                |
| **nuqs**                             | Filtros/tabs na URL              | Média                |
| **Sentry**                           | Erros em produção                | Baixa (pré-deploy)   |
| **next-intl**                        | i18n                             | Só se precisar PT/EN |

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

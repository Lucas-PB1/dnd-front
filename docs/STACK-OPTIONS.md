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

```text
src/          → app, domain, application, infrastructure, presentation, components, lib, proxy.ts
cypress/      → E2E
docs/         → documentação
public/       → assets estáticos
```

| Item               | Onde                                                     |
| ------------------ | -------------------------------------------------------- |
| Providers          | `src/presentation/providers/`                            |
| TanStack Query     | `src/presentation/hooks/`, `src/lib/query-client.ts`     |
| Forms              | RHF + Zod + shadcn `field`, `input`, `label`             |
| Clean Architecture | `src/domain/`, `src/application/`, `src/infrastructure/` |
| Supabase           | `src/infrastructure/supabase/`, `src/proxy.ts`           |

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

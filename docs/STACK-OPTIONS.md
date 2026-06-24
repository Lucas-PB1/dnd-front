# Stack dnd — decisões

Next.js 16 fullstack. Backend no próprio Next (sem .NET).

---

## Decisões

| Área              | Escolha                                                    |
| ----------------- | ---------------------------------------------------------- |
| **Arquitetura**   | Clean Architecture                                         |
| **Backend**       | Híbrido — Route Handlers + Server Actions                  |
| **Data client**   | TanStack Query                                             |
| **Validação**     | Zod                                                        |
| **Banco**         | Supabase                                                   |
| **UI**            | **shadcn/ui** (`components/ui/`)                           |
| **Ícones**        | **Heroicons** (`@heroicons/react`)                         |
| **Cores**         | Tema **Taverna / Masmorra** — ver [COLORS.md](./COLORS.md) |
| **Testes unit.**  | Vitest + Testing Library                                   |
| **E2E**           | Cypress                                                    |
| **Lint / format** | ESLint + Prettier                                          |

**Já configurado:** Next 16, React 19, Tailwind 4, shadcn, Heroicons, Clean Architecture, Zod, Supabase, **ESLint + Prettier**, **Vitest**, **Cypress**, Husky + lint-staged, pnpm.

**A configurar:** `.env.local` com keys do Supabase, TanStack Query.

---

## Pastas (Clean Architecture) ✅

```text
app/                    # presentation — rotas + app/api (finas)
presentation/           # componentes de tela por feature
domain/                 # entidades, regras, ports (interfaces)
application/            # casos de uso
infrastructure/         # Supabase, repos, di.ts
components/ui/          # shadcn
lib/                    # utils (cn)
```

---

## Design

| Item        | Regra                                              |
| ----------- | -------------------------------------------------- |
| Componentes | shadcn — `pnpm dlx shadcn@latest add <nome>`       |
| Ícones      | Heroicons outline (24) no app; solid para ênfase   |
| Cores       | Tokens `bg-primary`, `text-muted-foreground`, etc. |
| Radius      | `0.5rem` — cantos moderados (ficha, cards)         |
| Dark        | Classe `.dark` — tema Masmorra                     |

---

## Próximos passos

1. Copiar `.env.example` → `.env.local` e preencher Supabase ([SUPABASE.md](./SUPABASE.md))
2. TanStack Query
3. `next-themes` (toggle claro/escuro)

## Scripts

| Comando              | Função                 |
| -------------------- | ---------------------- |
| `pnpm lint`          | ESLint                 |
| `pnpm format`        | Prettier (escreve)     |
| `pnpm format:check`  | Prettier (só verifica) |
| `pnpm test`          | Vitest (watch)         |
| `pnpm test:run`      | Vitest (CI)            |
| `pnpm test:e2e`      | Cypress headless       |
| `pnpm test:e2e:open` | Cypress UI             |

Pre-commit (Husky): ESLint fix + Prettier nos arquivos staged.

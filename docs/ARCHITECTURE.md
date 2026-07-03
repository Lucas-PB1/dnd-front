# Feature-Sliced Design — dnd-front

Código em **`src/`**. Repo irmão da API: **`dnd-api`** (NestJS).

## Camadas FSD

```text
src/
├── app/                    # Next.js — rotas finas, providers globais
├── widgets/                # blocos compostos (header, system-status)
├── features/               # ações do usuário (auth, class-catalog, character-sheet)
├── entities/               # modelos de negócio (class, character, character-sheet)
├── shared/                 # ui, api, lib, config
│   ├── ui/                 # shadcn / Base UI
│   ├── api/
│   │   ├── dnd-api/        # catalogFetch, gameFetch
│   │   ├── supabase/       # browser/server clients
│   │   └── health/         # check local /api/health
│   └── lib/
└── proxy.ts                # sessão Supabase + rotas protegidas
```

## Regra de imports

| Camada     | Pode importar                       |
| ---------- | ----------------------------------- |
| `app`      | widgets, features, entities, shared |
| `widgets`  | features, entities, shared          |
| `features` | entities, shared                    |
| `entities` | shared                              |
| `shared`   | apenas pacotes npm                  |

**Proibido:** importar de camada superior.

## Divisão front / API / Supabase

| Assunto        | Front                      | API / Supabase            |
| -------------- | -------------------------- | ------------------------- |
| Login, sessão  | `features/auth`            | API valida JWT            |
| Catálogo PHB   | `features/class-catalog`   | `GET /classes`, …         |
| Fichas jogador | `features/characters`      | `GET/POST /characters`    |
| Wizard local   | `features/character-sheet` | dados JSON em `entities/` |
| Regras D&D     | **nunca** no front         | dnd-api                   |

## Nova feature

1. `entities/<nome>/` — tipos
2. `features/<nome>/` — api, model, ui
3. `widgets/` — composição (opcional)
4. `app/<rota>/page.tsx` — fino

## Stack

Next.js 16 · React 19 · TanStack Query · Supabase SSR · shadcn · Tailwind 4 · Zod · RHF

Ver: [STACK-OPTIONS.md](./STACK-OPTIONS.md) · [API-INTEGRATION.md](./API-INTEGRATION.md) · [SUPABASE.md](./SUPABASE.md)

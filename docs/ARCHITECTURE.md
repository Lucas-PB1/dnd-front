# Clean Architecture — dnd

Código da aplicação em **`src/`**. Na raiz ficam só config, testes E2E e docs.

## Estrutura

```text
dnd/
├── src/                      # código da aplicação
│   ├── app/                  # Next.js — rotas + api
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   ├── presentation/         # componentes, hooks, providers
│   ├── components/ui/        # shadcn
│   ├── lib/
│   └── proxy.ts              # sessão Supabase (Next 16)
├── cypress/                  # E2E
├── docs/
├── public/
└── *config*                  # package.json, tsconfig, eslint, etc.
```

## Camadas

| Camada             | Pasta                           | Pode importar               |
| ------------------ | ------------------------------- | --------------------------- |
| **Presentation**   | `src/app/`, `src/presentation/` | application, domain (tipos) |
| **Application**    | `src/application/`              | domain                      |
| **Domain**         | `src/domain/`                   | nada externo                |
| **Infrastructure** | `src/infrastructure/`           | domain, libs externas       |
| **UI kit**         | `src/components/ui/`            | shadcn                      |
| **Util**           | `src/lib/`                      | helpers transversais        |

## Fluxo

```text
app/api/route.ts  →  application/use-case  →  domain/port  ←  infrastructure/adapter
app/page.tsx      →  presentation/components  →  application (ou fetch /api)
```

## Regras

1. **domain/** — entidades, tipos, interfaces. Sem React, sem Supabase.
2. **application/** — casos de uso. Ports via parâmetro ou `infrastructure/di.ts`.
3. **infrastructure/** — adapters, Supabase, wiring.
4. **app/** — rotas finas: Zod → use case → response.
5. **presentation/** — UI de feature (não shadcn).

**Supabase:** [SUPABASE.md](./SUPABASE.md)

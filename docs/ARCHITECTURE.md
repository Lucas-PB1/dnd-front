# Clean Architecture — dnd

## Pastas

| Camada             | Pasta                   | Pode importar                    |
| ------------------ | ----------------------- | -------------------------------- |
| **Presentation**   | `app/`, `presentation/` | application, domain (tipos)      |
| **Application**    | `application/`          | domain                           |
| **Domain**         | `domain/`               | nada externo                     |
| **Infrastructure** | `infrastructure/`       | domain, libs externas (Supabase) |
| **UI kit**         | `components/ui/`        | shadcn — só apresentação         |
| **Util**           | `lib/`                  | helpers sem regra de negócio     |

## Fluxo

```text
app/api/route.ts  →  application/use-case  →  domain/port  ←  infrastructure/adapter
app/page.tsx      →  presentation/components  →  application (ou fetch /api)
```

## Regras

1. **domain/** — entidades, tipos, interfaces de repositório. Sem React, sem Supabase.
2. **application/** — casos de uso (funções ou classes finas). Recebe ports por parâmetro ou DI em `infrastructure/di.ts`.
3. **infrastructure/** — implementa ports; client Supabase; wiring em `di.ts`.
4. **app/** — rotas finas: valida com **Zod** (`lib/zod.ts`), chama use case, retorna response.
5. **presentation/** — componentes de tela por feature (não shadcn).

## Exemplo

`GET /api/health` → `getHealthStatus()` → `HealthRepository` → Supabase ou fallback estático. Resposta validada com Zod.

**Supabase:** ver [SUPABASE.md](./SUPABASE.md).

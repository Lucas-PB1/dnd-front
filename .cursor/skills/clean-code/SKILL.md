---
name: clean-code
description: Clean Code practices for dnd-front. Use when refactoring for readability, naming, function size, or reducing complexity. Complements rule 02-clean-code.
disable-model-invocation: true
---

# Clean Code — dnd-front

## Nomes

- Funções: verbo + objeto (`checkHealth`, `fetchFeatsPage`, `toCreatePayload`)
- Tipos: substantivo (`HealthStatus`, `WeaponSummary`)
- Arquivos: kebab-case

## Funções

- Uma responsabilidade por função
- Preferir &lt; ~30 linhas; extrair se passar disso
- Early return em guards (env ausente, erro de validação)

## Comentários

Só para regras de negócio não óbvias ou constraints de plataforma (ex.: proxy vs middleware).

## Route handlers / pages

Rotas finas — exemplo:

```typescript
// app/api/health/route.ts
export async function GET() {
  const health = await checkHealth();
  return Response.json(toHealthResponse(health));
}
```

```typescript
// app/characters/[id]/page.tsx
<CharacterSheetView id={id} />
```

Lógica fica em `shared/api`, `features/*/api` ou `features/*/model` — não na page/route.

Ver [reference.md](reference.md).

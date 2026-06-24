---
name: clean-code
description: Clean Code practices for dnd. Use when refactoring for readability, naming, function size, or reducing complexity. Complements rule 02-clean-code.
disable-model-invocation: true
---

# Clean Code — dnd

## Nomes

- Funções: verbo + objeto (`getHealthStatus`, `fetchHealth`, `toHealthResponse`)
- Tipos: substantivo (`HealthStatus`, `HealthRepository`)
- Arquivos: kebab-case ou nome do export principal

## Funções

- Uma responsabilidade por função
- Preferir &lt; ~30 linhas; extrair se passar disso
- Early return em guards (env ausente, erro de validação)

## Comentários

Só para regras de negócio não óbvias ou constraints de plataforma (ex.: proxy vs middleware).

## Route handlers

Rotas finas — exemplo bom:

```typescript
export async function GET() {
  const health = await getHealthStatus(healthRepository);
  return Response.json(toHealthResponse(health));
}
```

Lógica de negócio fica em `application/`, não na route.

Ver [reference.md](reference.md).

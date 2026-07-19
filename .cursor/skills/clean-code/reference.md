# Clean Code — exemplos

## Health fino

```typescript
import { checkHealth } from "@/shared/api/health/check-health";
import { toHealthResponse } from "@/shared/api/health/to-health-response";

export async function GET() {
  return Response.json(toHealthResponse(await checkHealth()));
}
```

## Ficha — sem alias legado

Usar `CharacterSheetView` direto na rota `/characters/[id]`. Não recriar wrappers `@deprecated`.

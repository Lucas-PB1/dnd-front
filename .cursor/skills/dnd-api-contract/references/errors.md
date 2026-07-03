# Erros da API no front

## Formato (Nest)

```json
{
  "statusCode": 404,
  "message": "Class 'x' not found",
  "path": "/classes/x",
  "timestamp": "2026-..."
}
```

`message` pode ser `string` ou `string[]`.

## Cliente

`shared/api/dnd-api/api-error.ts` — classe `ApiError`:

| Status | Ação no front                      |
| ------ | ---------------------------------- |
| 401    | Redirect `/login?next=...`         |
| 403    | Toast / mensagem sem permissão     |
| 404    | Not found na UI                    |
| 422    | Exibir erros de validação do DTO   |
| 5xx    | Mensagem genérica + retry opcional |

## Exemplo

```typescript
import { ApiError } from "@/shared/api/dnd-api/api-error";

try {
  await gameFetch("/characters", token);
} catch (e) {
  if (e instanceof ApiError && e.isUnauthorized) {
    router.push("/login?next=/characters");
  }
}
```

## Regra

Não parsear mensagens para lógica de negócio — usar `statusCode` e tipos da API.

---
name: next-api
description: Route Handlers for dnd-front.
disable-model-invocation: true
---

# Route Handlers

```typescript
// app/api/health/route.ts
import { checkHealth } from "@/shared/api/health/check-health";
import { toHealthResponse } from "@/shared/api/health/health.schema";

export async function GET() {
  return Response.json(toHealthResponse(await checkHealth()));
}
```

Lógica em `shared/api/` ou `features/*/api/` — não na route.

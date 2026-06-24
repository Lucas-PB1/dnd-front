# DRY — health module

## Schema reutilizado

`healthResponseSchema` + `toHealthResponse()` em `application/health/health.schema.ts`

Route:

```typescript
return Response.json(toHealthResponse(health));
```

Hook:

```typescript
// fetchHealth retorna HealthResponse — mesmo shape validado
```

## Evitar

Definir `{ status, timestamp, database }` manualmente em route, hook e teste — usar schema único.

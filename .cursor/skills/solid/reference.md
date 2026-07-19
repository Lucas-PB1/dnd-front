# SOLID — exemplos FSD

## DIP — health

```typescript
// shared/api/health/check-health.ts
export async function checkHealth(): Promise<HealthStatus> { /* supabase ou degraded */ }

// app/api/health/route.ts — fino
export async function GET() {
  const health = await checkHealth();
  return Response.json(toHealthResponse(health));
}
```

## SRP — fichas

| Slice | Responsabilidade |
| ----- | ---------------- |
| `features/characters` | Listagem |
| `features/character-sheet` | Detalhe, edição, mesa |
| `features/create-character` | Wizard de criação |

## ISP

Exportar só o necessário no `index.ts` do slice; consumidores preferem deep imports quando o barrel não agrega valor.

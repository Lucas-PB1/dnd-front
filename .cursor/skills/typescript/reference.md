# TypeScript — exemplos

## Health

```typescript
// shared/api/health/types.ts
export type HealthStatus = {
  status: "ok" | "degraded";
  timestamp: Date;
  database: "ok" | "degraded";
};
```

## Entidades espelhando dnd-api

```typescript
// entities/weapon/types.ts — espelha WeaponResponseDto
export type WeaponSummary = {
  slug: string;
  range: WeaponRange | null;
  propertyDetails: WeaponTrait[];
  mastery: WeaponTrait | null;
  // …
};
```

## Character feats

Usar `CharacterFeat` de `entities/character/lib/character-feat` (reexportado em `sheet-types`).

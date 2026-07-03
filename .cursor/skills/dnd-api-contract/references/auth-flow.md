# Auth flow — front + API

## 1. Login (front)

```typescript
// features/auth — Supabase browser client
await supabase.auth.signInWithPassword({ email, password });
```

Sessão em cookies — `src/proxy.ts` renova com `getUser()`.

## 2. Chamada protegida (front)

```typescript
const token = session?.access_token;
await gameFetch("/characters", token);
```

Header enviado: `Authorization: Bearer <access_token>`

## 3. Validação (dnd-api)

- `SupabaseAuthGuard` em rotas `/characters/*`
- JWKS: `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`
- Payload: `sub` → `user.id`, `email` opcional

## 4. Postgres (Supabase)

- RLS com `auth.uid()` em tabelas de jogador
- Catálogo `phb_*` permanece leitura pública

## O que cada repo faz

| Ação            | dnd-front    | dnd-api     | Supabase Auth  |
| --------------- | ------------ | ----------- | -------------- |
| Cadastro        | ✅ signUp    | —           | ✅             |
| Login           | ✅ signIn    | —           | ✅             |
| Validar token   | —            | ✅ JWKS     | emite JWT      |
| CRUD personagem | gameFetch    | ✅ handlers | RLS            |
| Catálogo PHB    | catalogFetch | ✅ queries  | SELECT público |

## Rotas protegidas no front

Config: `shared/lib/auth-routes.ts` + `proxy.ts`

## Erro 401

Redirect `/login?next=<path>` — ver skill `dnd-api-client`

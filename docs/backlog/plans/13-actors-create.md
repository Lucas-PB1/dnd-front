# Plano 13 — `POST /actors`

**ID:** FR-38 · **Dificuldade:** fácil · **Status:** Feito

## Gap

Criar actor em branco (`CreateActorDto`). Front só faz `spawn-from-template`.

## Fazer

Client autenticado. UI mínima pode ficar na página de actor se já houver “criar”; senão só a função.

## Pronto quando

POST cria actor sem template.

## Feito

`createActor` + `useCreateActor` + tipo `CreateActorPayload` (`actorKind` + `name` obrigatórios). Sem UI: não havia “criar” na ficha de actor.

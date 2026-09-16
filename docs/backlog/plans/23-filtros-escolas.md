# Plano 23 — Filtros: escolas de magia

**ID:** FR-1 · **Dificuldade:** média · **Status:** Blocked

## Gap

`SPELL_SCHOOL_FILTER` é array PT. Escolas estão em `phb_spell_school`. Sem `GET /spell-schools`. Query `?school=` no `GET /spells` **já** é consumida.

## Fazer

Na API: endpoint de lista (slug + name). No front: `buildSpellSchoolFilter(schools)` como abilities. Não derivar de página paginada de magias.

## Pronto quando

Filtro do compêndio só lista escolas do DB.

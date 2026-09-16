# Plano 23 — Filtros: escolas de magia

**ID:** FR-1 · **Dificuldade:** média · **Status:** Feito

## Gap

`buildSpellSchoolFilter` em `entities/spell` ainda usa `SPELL_SCHOOL_OPTIONS` local. Escolas estão em `phb_spell_school`. Sem `GET /spell-schools`. Query `?school=` no `GET /spells` **já** é consumida.

## Fazer

Na API: endpoint de lista (slug + name). No front: `buildSpellSchoolFilter(schools)` como abilities. Não derivar de página paginada de magias.

## Pronto quando

Filtro do compêndio só lista escolas do DB.

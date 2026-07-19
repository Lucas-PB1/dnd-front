---
name: ui-icons
description: >-
  Heroicons e padrões de ícone no dnd-front. Use when adding icons, back/forward
  navigation arrows, chevrons, search icons, or replacing unicode/emoji icons.
disable-model-invocation: true
---

# Ícones — Heroicons

Pacote: `@heroicons/react` (já instalado).

## Preferência

| Uso                                       | Pacote                                                                     |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| Ícones do app (nav, busca, chevron, tema) | `@heroicons/react/24/outline`                                              |
| Ênfase pontual (raro)                     | `@heroicons/react/24/solid`                                                |
| shadcn CLI pode puxar Lucide              | Aceitar só dentro do primitivo gerado; **não** importar Lucide em features |

## Anti-padrões

```tsx
// ❌
<span>← Classes</span>
<span>Ver →</span>

// ✅
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
<ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
```

- Não usar emoji como ícone de UI
- Marcar decorativos com `aria-hidden`; botões só-ícone precisam de `aria-label`

## Tamanhos

- Inline com texto `text-sm`: `size-4`
- Texto `text-xs`: `size-3.5`
- Botão `size="icon"`: deixar o SVG herdar (`size-4` no ícone ou padrão do `Button`)

## Voltar

Sempre `BackLink` — ver skill `ui-catalog`.

```tsx
import { BackLink } from "@/shared/ui/back-link";

<BackLink href="/classes">Classes</BackLink>;
```

## Já em uso

| Componente                               | Ícone                    |
| ---------------------------------------- | ------------------------ |
| `shared/ui/back-link.tsx`                | `ArrowLeftIcon`          |
| `shared/ui/catalog-search.tsx`           | `MagnifyingGlassIcon`    |
| `shared/ui/collapsible-card.tsx`         | `ChevronDownIcon`        |
| `widgets/app-header`                     | `Bars3Icon`, `XMarkIcon` |
| `widgets/app-header/ui/theme-toggle.tsx` | `SunIcon`, `MoonIcon`    |

## Texto com seta semântica

Em labels de progressão (`3 → 4`, “Força → …”) o caractere `→` tipográfico é ok — não é controle de UI.

"use client";

import { useState } from "react";

import {
  useAddInventoryItem,
  useCharacterInventory,
  usePatchInventoryItem,
  useRemoveInventoryItem,
} from "@/features/character-sheet/api/use-character-inventory";
import { Button } from "@/shared/ui/button";
import { Field, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

const LOCATION_LABELS = {
  equipped: "Equipado",
  backpack: "Mochila",
} as const;

type InventorySectionProps = {
  characterId: string;
};

export function InventorySection({ characterId }: InventorySectionProps) {
  const inventory = useCharacterInventory(characterId);
  const addItem = useAddInventoryItem(characterId);
  const patchItem = usePatchInventoryItem(characterId);
  const removeItem = useRemoveInventoryItem(characterId);

  const [newSlug, setNewSlug] = useState("");
  const [newQty, setNewQty] = useState("1");

  const items = inventory.data?.items ?? [];
  const equipped = items.filter((i) => i.location === "equipped");
  const backpack = items.filter((i) => i.location === "backpack");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newSlug.trim()) return;
    await addItem.mutateAsync({
      itemSlug: newSlug.trim(),
      quantity: Number(newQty) || 1,
    });
    setNewSlug("");
    setNewQty("1");
  }

  if (inventory.isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando inventário…</p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Itens adquiridos em jogo — separado do equipamento inicial da criação.
      </p>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <Field className="min-w-[180px] flex-1">
          <FieldLabel htmlFor="item-slug">Slug do item</FieldLabel>
          <Input
            id="item-slug"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="ex.: longsword"
          />
        </Field>
        <Field className="w-24">
          <FieldLabel htmlFor="item-qty">Qtd</FieldLabel>
          <Input
            id="item-qty"
            type="number"
            min={1}
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
          />
        </Field>
        <Button type="submit" disabled={addItem.isPending || !newSlug.trim()}>
          {addItem.isPending ? "Adicionando…" : "Adicionar"}
        </Button>
      </form>

      <InventoryGroup
        title="Equipado"
        items={equipped}
        onToggleLocation={(slug, current) =>
          patchItem.mutate({
            itemSlug: slug,
            payload: {
              location: current === "equipped" ? "backpack" : "equipped",
            },
          })
        }
        onRemove={(slug) => removeItem.mutate(slug)}
        isPending={patchItem.isPending || removeItem.isPending}
      />

      <InventoryGroup
        title="Mochila"
        items={backpack}
        onToggleLocation={(slug, current) =>
          patchItem.mutate({
            itemSlug: slug,
            payload: {
              location: current === "equipped" ? "backpack" : "equipped",
            },
          })
        }
        onRemove={(slug) => removeItem.mutate(slug)}
        isPending={patchItem.isPending || removeItem.isPending}
      />

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Inventário vazio.</p>
      ) : null}

      {(addItem.error ?? patchItem.error ?? removeItem.error) ? (
        <p className="text-sm text-destructive" role="alert">
          {(addItem.error ?? patchItem.error ?? removeItem.error) instanceof
          Error
            ? (addItem.error ?? patchItem.error ?? removeItem.error)?.message
            : "Erro no inventário"}
        </p>
      ) : null}
    </div>
  );
}

function InventoryGroup({
  title,
  items,
  onToggleLocation,
  onRemove,
  isPending,
}: {
  title: string;
  items: {
    itemSlug: string;
    itemName: string;
    quantity: number;
    location: "equipped" | "backpack";
    equipmentSlot: string | null;
  }[];
  onToggleLocation: (slug: string, location: "equipped" | "backpack") => void;
  onRemove: (slug: string) => void;
  isPending: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{title}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.itemSlug}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
          >
            <div>
              <span className="font-medium">{item.itemName}</span>
              <span className="ml-2 text-muted-foreground">
                × {item.quantity}
              </span>
              {item.equipmentSlot ? (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({item.equipmentSlot})
                </span>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={isPending}
                onClick={() => onToggleLocation(item.itemSlug, item.location)}
              >
                Mover para{" "}
                {item.location === "equipped"
                  ? LOCATION_LABELS.backpack
                  : LOCATION_LABELS.equipped}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className={cn("text-destructive")}
                disabled={isPending}
                onClick={() => onRemove(item.itemSlug)}
              >
                Remover
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

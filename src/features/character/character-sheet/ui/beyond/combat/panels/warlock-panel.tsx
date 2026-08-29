"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { ClassOption } from "@/entities/character/sheet-types";
import type { CharacterState } from "@/entities/character/session-types";
import type { ClassPanelActionRecord } from "@/entities/combat-mechanical/types";
import {
  executeWarlockTableAction,
  type WarlockTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { inventoryKeys } from "@/features/character/character-sheet/api/character-inventory.api";
import { useCastSpell } from "@/features/character/character-sheet/api/use-character-state";
import { useCharacterInventory } from "@/features/character/character-sheet/api/use-character-inventory";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";
import {
  eldritchInvocationKindLabel,
  eldritchInvocationMetaLine,
  isEldritchOncePerLongRestInvocation,
  readEldritchInvocationPicks,
} from "@/features/character/character-sheet/lib/warlock/eldritch-invocations";
import { isMeleeWeaponFromPropertySlugs } from "@/features/character/character-sheet/lib/warlock/pact-blade";
import { FeatureDetailTrigger } from "@/features/character/character-sheet/ui/sheet/feature-detail-dialog";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { useEldritchInvocations } from "@/features/catalog/eldritch-invocation-catalog/api/use-eldritch-invocations";
import { fetchAllWeapons } from "@/features/catalog/equipment-catalog/api/weapons.api";
import { useSpellLabels } from "@/features/catalog/spell-catalog/api/use-spells";
import { Button } from "@/shared/ui/button";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import { CombatPanelActionButtons } from "../shared/panel-action-buttons";
import { TableActionFeedback } from "../shared/table-action-feedback";

const PACT_OF_THE_BLADE = "pact-of-the-blade";
const INVOKE_PACT_WEAPON = "invoke-pact-weapon";
const NOTE_INVOCATION_KINDS = new Set(["bonus", "action", "note", "reaction"]);
const EMPTY_PANEL_ACTIONS: ClassPanelActionRecord[] = [];

type CombatWarlockPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
  classOptions?: ClassOption[] | null;
};

export function CombatWarlockPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
  classOptions,
}: CombatWarlockPanelProps) {
  const queryClient = useQueryClient();
  const action = useTableActionMutation(characterId, executeWarlockTableAction);
  const castSpell = useCastSpell(characterId);
  const mechanicalCatalog = useCombatMechanicalCatalog({ classSlug, subclassSlug });
  const panelCatalog =
    mechanicalCatalog.data?.panelActions ?? EMPTY_PANEL_ACTIONS;
  const invocationsQuery = useEldritchInvocations(level);
  const spellLabels = useSpellLabels();
  const inventory = useCharacterInventory(characterId);
  const weaponsCatalog = useQuery({
    queryKey: ["weapons", "all-pact-blade"],
    queryFn: () => fetchAllWeapons(),
    staleTime: 60_000,
  });
  const knownPicks = readEldritchInvocationPicks(classOptions);
  const knownSlugs = knownPicks.map((pick) => pick.slug);
  const hasPactOfTheBlade = knownSlugs.includes(PACT_OF_THE_BLADE);

  const [pactWeaponSlug, setPactWeaponSlug] = useState("");
  const [pactModalOpen, setPactModalOpen] = useState(false);
  const [localNote, setLocalNote] = useState<string | null>(null);
  const [feedbackZone, setFeedbackZone] = useState<"tools" | "powers" | null>(
    null,
  );

  const spellNameBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const spell of spellLabels.data?.data ?? []) {
      map.set(spell.slug, spell.name);
    }
    return map;
  }, [spellLabels.data]);

  const baseActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "warlock",
        level,
        subclassSlug,
        section: "base",
      }).filter((entry) => entry.slug !== INVOKE_PACT_WEAPON),
    [panelCatalog, level, subclassSlug],
  );
  const subclassActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "warlock",
        level,
        subclassSlug,
        section: "subclass",
      }),
    [panelCatalog, level, subclassSlug],
  );

  const invocationBySlug = new Map(
    (invocationsQuery.data ?? []).map((row) => [row.slug, row]),
  );
  const knownInvocations = knownSlugs
    .map((slug) => invocationBySlug.get(slug))
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  const meleeWeaponOptions = useMemo(() => {
    const weapons = inventory.data?.items ?? [];
    const bySlug = new Map(
      (weaponsCatalog.data?.data ?? []).map((weapon) => [weapon.slug, weapon]),
    );
    return weapons
      .filter((item) => item.itemType === "weapon")
      .filter((item) => {
        const catalog = bySlug.get(item.itemSlug);
        const propertySlugs =
          catalog?.propertyDetails.map((property) => property.slug) ?? [];
        return isMeleeWeaponFromPropertySlugs(propertySlugs);
      })
      .map((item) => ({
        value: item.itemSlug,
        label: item.isPactWeapon
          ? `${item.itemName} (pacto)`
          : item.itemName,
      }));
  }, [inventory.data?.items, weaponsCatalog.data?.data]);

  const currentPactWeapon = useMemo(
    () =>
      (inventory.data?.items ?? []).find((item) => item.isPactWeapon) ?? null,
    [inventory.data?.items],
  );

  if (classSlug !== "warlock") return null;

  const resources = state?.classResources ?? [];

  function getRemaining(slug: string): number | null {
    return resources.find((entry) => entry.slug === slug)?.remaining ?? null;
  }

  function runTableAction(
    slug: WarlockTableActionSlug,
    zone: "tools" | "powers",
    itemSlug?: string,
  ) {
    setLocalNote(null);
    setFeedbackZone(zone);
    action.mutate(
      { actionSlug: slug, itemSlug },
      {
        onSuccess: () => {
          if (slug === INVOKE_PACT_WEAPON) {
            void queryClient.invalidateQueries({
              queryKey: inventoryKeys.list(characterId),
            });
          }
        },
      },
    );
  }

  const noteInvocations = knownInvocations.filter(
    (row) =>
      row.slug !== PACT_OF_THE_BLADE && NOTE_INVOCATION_KINDS.has(row.kind),
  );
  const freeCastInvocations = knownInvocations.filter(
    (row) => row.kind === "free_cast" && Boolean(row.grantedSpellSlug),
  );

  const busy = action.isPending || castSpell.isPending;

  function freeCastRemaining(spellSlug: string): number | null {
    const option = state?.grantedSpellCastOptions?.find(
      (entry) => entry.spellSlug === spellSlug,
    );
    return option?.freeCastsRemaining ?? null;
  }

  function canFreeCastInvocation(row: (typeof freeCastInvocations)[number]): boolean {
    if (!row.grantedSpellSlug) return false;
    if (!isEldritchOncePerLongRestInvocation(row.slug)) return true;
    const remaining = freeCastRemaining(row.grantedSpellSlug);
    return remaining == null || remaining > 0;
  }

  function runFreeCastInvocation(
    row: (typeof freeCastInvocations)[number],
  ) {
    if (!row.grantedSpellSlug || !canFreeCastInvocation(row)) return;
    setLocalNote(null);
    setFeedbackZone("powers");
    castSpell.mutate(
      {
        spellSlug: row.grantedSpellSlug,
        ...(isEldritchOncePerLongRestInvocation(row.slug)
          ? { useFreeCast: true }
          : {}),
      },
      {
        onSuccess: (result) => {
          if (result?.note) setLocalNote(result.note);
        },
      },
    );
  }

  const actionsContent = (
    <div className="space-y-2">
      <CombatPanelActionButtons
        actions={baseActions}
        getRemaining={getRemaining}
        isPending={busy}
        onAction={(slug) =>
          runTableAction(slug as WarlockTableActionSlug, "tools")
        }
      />

      {feedbackZone === "tools" ? (
        <TableActionFeedback
          lastResultNote={localNote ?? action.lastResult?.note}
          error={action.error}
        />
      ) : null}
    </div>
  );

  const powersContent = (
    <div className="space-y-3">
      {subclassActions.length > 0 ? (
        <div className="space-y-2">
          {subclassSlug === "archfey" ? (
            <p className="text-xs font-medium text-muted-foreground">
              Passos Feéricos (usos = CAR): Passo Nebuloso sem espaço; escolha o
              efeito na mesa (Provocante ou Revigorante
              {level >= 6 ? "; L6+: Desvanecedor ou Terrível" : ""}).
            </p>
          ) : null}
          <CombatPanelActionButtons
            actions={subclassActions}
            getRemaining={getRemaining}
            isPending={busy}
            variant="secondary"
            onAction={(slug) =>
              runTableAction(slug as WarlockTableActionSlug, "powers")
            }
          />
        </div>
      ) : null}

      {hasPactOfTheBlade ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Arma de Pacto
          </p>
          {currentPactWeapon ? (
            <p className="text-xs text-foreground">
              Vinculada: {currentPactWeapon.itemName}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Nenhuma arma vinculada ainda.
            </p>
          )}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy || meleeWeaponOptions.length === 0}
            onClick={() => {
              setPactWeaponSlug(
                currentPactWeapon?.itemSlug ??
                  meleeWeaponOptions[0]?.value ??
                  "",
              );
              setPactModalOpen(true);
            }}
          >
            Invocar Arma de Pacto
          </Button>
          {meleeWeaponOptions.length === 0 ? (
            <p className="text-[0.65rem] text-muted-foreground">
              Sem armas corpo a corpo na mochila.
            </p>
          ) : (
            <p className="text-[0.65rem] text-muted-foreground">
              Ação Bônus: marca a arma, equipa na mão principal e usa Carisma no
              ataque/dano (Necrótico/Psíquico/Radiante opcional).
            </p>
          )}

          <Dialog
            open={pactModalOpen}
            onOpenChange={(open) => {
              setPactModalOpen(open);
              if (!open) setPactWeaponSlug("");
            }}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invocar Arma de Pacto</DialogTitle>
                <DialogDescription>
                  Escolha uma arma corpo a corpo da mochila. Ela será vinculada
                  e equipada na mão principal.
                </DialogDescription>
              </DialogHeader>

              <ul className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border/60 p-1">
                {meleeWeaponOptions.map((option) => {
                  const selected = pactWeaponSlug === option.value;
                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        className={
                          selected
                            ? "w-full rounded-md bg-primary/15 px-2.5 py-2 text-left text-sm font-medium text-foreground"
                            : "w-full rounded-md px-2.5 py-2 text-left text-sm text-foreground hover:bg-muted/50"
                        }
                        onClick={() => setPactWeaponSlug(option.value)}
                      >
                        {option.label}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPactModalOpen(false)}
                  disabled={busy}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={busy || !pactWeaponSlug}
                  onClick={() => {
                    runTableAction(
                      INVOKE_PACT_WEAPON,
                      "powers",
                      pactWeaponSlug || undefined,
                    );
                    setPactModalOpen(false);
                  }}
                >
                  Invocar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : null}

      {noteInvocations.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {noteInvocations.map((row) => (
            <Button
              key={row.slug}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setFeedbackZone("powers");
                setLocalNote(
                  `${row.name}: ${row.description.trim() || "Nota de mesa."}`,
                );
              }}
            >
              {row.name}
            </Button>
          ))}
        </div>
      ) : null}

      {freeCastInvocations.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Conjurar sem espaço (invocação)
          </p>
          <div className="flex flex-wrap gap-2">
            {freeCastInvocations.map((row) => {
              const spellSlug = row.grantedSpellSlug!;
              const oncePer = isEldritchOncePerLongRestInvocation(row.slug);
              const remaining = freeCastRemaining(spellSlug);
              const enabled = canFreeCastInvocation(row);
              const spellName =
                spellNameBySlug.get(spellSlug) ?? spellSlug;
              return (
                <Button
                  key={row.slug}
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={busy || !enabled}
                  title={
                    oncePer && remaining != null
                      ? `${spellName} · ${remaining} restante(s)`
                      : spellName
                  }
                  onClick={() => runFreeCastInvocation(row)}
                >
                  {row.name}
                  {oncePer && remaining != null ? ` (${remaining})` : ""}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}

      <CollapsibleCard
        size="compact"
        defaultOpen={false}
        className="border-border/60 bg-background/30"
        title={`Invocações Místicas${
          knownInvocations.length > 0 ? ` (${knownInvocations.length})` : ""
        }`}
        subtitle="Conjurações acima · toque no nome para o texto completo · troca na aba Magias."
      >
        {invocationsQuery.isPending ? (
          <p className="text-xs text-muted-foreground">Carregando invocações…</p>
        ) : knownInvocations.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhuma selecionada — configure na aba Magias.
          </p>
        ) : (
          <ul className="divide-y divide-border/40">
            {knownInvocations.map((row) => {
              const grantedSpellName = row.grantedSpellSlug
                ? (spellNameBySlug.get(row.grantedSpellSlug) ?? null)
                : null;
              const boundPick = knownPicks.find((pick) => pick.slug === row.slug);
              const boundCantripSlug = boundPick?.cantripSlug;
              const boundCantripName = boundCantripSlug
                ? (spellNameBySlug.get(boundCantripSlug) ?? boundCantripSlug)
                : null;
              const boundOriginFeatName = boundPick?.originFeatSlug ?? null;
              const kindLabel = eldritchInvocationKindLabel(row.kind, row.slug);
              const meta = eldritchInvocationMetaLine({
                kindLabel,
                grantedSpellName,
                boundCantripName,
                boundOriginFeatName,
              });
              const summary =
                row.description.trim().length > 0
                  ? row.description.trim()
                  : null;

              return (
                <li key={row.slug} className="px-0.5 py-2 first:pt-0 last:pb-0">
                  {summary ? (
                    <FeatureDetailTrigger
                      variant="text"
                      title={row.name}
                      subtitle={meta}
                      description={summary}
                    >
                      <span className="text-sm font-medium text-foreground underline-offset-2 hover:underline">
                        {row.name}
                      </span>
                      <span className="mt-0.5 block text-[0.7rem] text-muted-foreground">
                        {meta}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground line-clamp-2">
                        {summary}
                      </span>
                    </FeatureDetailTrigger>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {row.name}
                      </p>
                      <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                        {meta}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CollapsibleCard>

      {feedbackZone === "powers" ? (
        <TableActionFeedback
          lastResultNote={localNote ?? action.lastResult?.note}
          error={action.error ?? castSpell.error}
        />
      ) : null}
    </div>
  );

  return (
    <CombatClassPanelShell
      title="Combate do Bruxo (Magia de Pacto)"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
    />
  );
}

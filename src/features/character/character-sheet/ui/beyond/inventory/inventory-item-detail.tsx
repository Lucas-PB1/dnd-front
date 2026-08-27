"use client";

import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  LinkIcon,
  LinkSlashIcon,
  ShieldExclamationIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo, useState } from "react";

import type {
  InventoryItem,
  PatchInventoryItemPayload,
} from "@/entities/character/session-types";
import type { EquipmentWarning } from "@/entities/character/types";
import {
  useBoardVehicle,
  useCharacterActors,
  useLinkVehicle,
} from "@/features/actor/api/use-actors";
import { useSpellLabels } from "@/features/catalog/spell-catalog/api/use-spells";
import {
  MAX_ATTUNED_ITEMS,
  SLOT_LABELS,
  SLOT_OPTIONS,
  effectsStatusLabel,
  itemTypeLabel,
  type EquipmentSlot,
} from "@/features/character/character-sheet/ui/beyond/inventory/inventory-item-meta";
import { QuantityStepper } from "@/features/character/character-sheet/ui/beyond/inventory/quantity-stepper";
import { ItemCatalogDescriptionBlock } from "@/features/catalog/item-catalog/ui/item-catalog-description-block";
import {
  formatCoinPurse,
  halfCoinPurseClient,
  parseCostTextClient,
  scaleCoinPurseClient,
} from "@/features/character/character-sheet/ui/beyond/inventory/beyond-coin-purse";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { SearchableSelect } from "@/shared/ui/searchable-select";

type InventoryItemDetailProps = {
  item: InventoryItem;
  characterId?: string;
  isPending: boolean;
  attunementSlotsFull: boolean;
  warnings: EquipmentWarning[];
  weaponOptions?: { value: string; label: string }[];
  canBindPactWeapon?: boolean;
  onToggleLocation: (item: InventoryItem) => void;
  onToggleAttunement: (item: InventoryItem) => void;
  onPatch: (slug: string, payload: PatchInventoryItemPayload) => void;
  onRemove: (slug: string) => void;
  onAttachCharm?: (weaponSlug: string, charmSlug: string) => void;
  onDetachCharm?: (weaponSlug: string) => void;
  baseOptions?: {
    value: string;
    label: string;
    itemType?: string;
    equipmentSlot?: string | null;
  }[];
  containerOptions?: { value: string; label: string }[];
  onAttachCoverage?: (
    baseItemSlug: string,
    coverageSlug: string,
    bonus?: 1 | 2 | 3,
    spellSlug?: string,
  ) => void;
  onDetachCoverage?: (baseItemSlug: string) => void;
  /** Em campanha (player): remover vende por ½ do catálogo. */
  sellCreditApplies?: boolean;
};

function isBoardableTransportKind(kind: string | null | undefined): boolean {
  return (
    kind === "mount" || kind === "drawn-vehicle" || kind === "large-vehicle"
  );
}

function hostsForCoverageSlug(
  coverageSlug: string,
  options: Array<{
    value: string;
    label: string;
    itemType?: string;
    equipmentSlot?: string | null;
  }>,
) {
  const slug = coverageSlug.toLowerCase();
  if (slug.includes("escudo")) {
    return options.filter(
      (o) =>
        o.equipmentSlot === "shield" ||
        /escudo|shield/i.test(`${o.value} ${o.label}`),
    );
  }
  if (slug.includes("armadura")) {
    return options.filter(
      (o) =>
        o.itemType === "armor" &&
        o.equipmentSlot !== "shield" &&
        !/escudo|shield/i.test(`${o.value} ${o.label}`),
    );
  }
  if (slug.includes("arma") || slug.includes("municao") || slug.includes("varinha")) {
    return options.filter((o) => o.itemType === "weapon");
  }
  return options;
}

function isWeaponCharmSlug(slug: string): boolean {
  return slug.startsWith("weapon-charm-");
}

function coverageNeedsTier(slug: string): boolean {
  return (
    slug === "arma-1-2-ou-3" ||
    slug === "armadura-1-2-ou-3" ||
    slug === "escudo-1-2-ou-3" ||
    slug === "municao-1-2-ou-3" ||
    slug === "varinha-do-mago-de-guerra-1-2-ou-3"
  );
}

const ENSPELLED_COVERAGE_PROFILES: Record<
  string,
  { schools: Set<string> | null; maxLevel: number }
> = {
  "arma-magificada": {
    schools: new Set([
      "adivinhacao",
      "evocacao",
      "invocacao",
      "necromancia",
      "transmutacao",
    ]),
    maxLevel: 8,
  },
  "armadura-magificada": {
    schools: new Set(["abjuracao", "ilusao"]),
    maxLevel: 8,
  },
};

const ENSPELLED_UNIQUE_PROFILES: Record<
  string,
  { schools: Set<string> | null; maxLevel: number }
> = {
  "cajado-magificado": { schools: null, maxLevel: 8 },
};

type RolledProp = {
  slug?: string;
  summaryPt?: string;
  effect?: Record<string, unknown>;
};

function readRolledList(value: unknown): RolledProp[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is RolledProp =>
      entry != null && typeof entry === "object" && !Array.isArray(entry),
  );
}

function formatRolledPropLabel(prop: RolledProp): string {
  const base = prop.summaryPt ?? prop.slug ?? "Propriedade";
  const effect =
    prop.effect != null &&
    typeof prop.effect === "object" &&
    !Array.isArray(prop.effect)
      ? prop.effect
      : null;
  if (!effect || typeof effect.type !== "string") return base;
  if (effect.type === "artifactSpell") {
    const spent = effect.spentUntilLongRest === true ? " · usado até DL" : "";
    const slug =
      typeof effect.spellSlug === "string" ? ` → ${effect.spellSlug}` : "";
    return `${base}${slug}${spent}`;
  }
  if (effect.type === "artifactRegen") {
    return `${base} (ação na ficha)`;
  }
  if (effect.type === "abilityPenalty") {
    return `${base} (até Restauração Maior)`;
  }
  return base;
}

function InstancePropertiesSummary({
  instanceProperties,
}: {
  instanceProperties?: Record<string, unknown> | null;
}) {
  if (!instanceProperties) return null;
  const artifactRandom =
    instanceProperties.artifactRandom != null &&
    typeof instanceProperties.artifactRandom === "object" &&
    !Array.isArray(instanceProperties.artifactRandom)
      ? (instanceProperties.artifactRandom as Record<string, unknown>)
      : null;
  const sentience =
    instanceProperties.sentience != null &&
    typeof instanceProperties.sentience === "object" &&
    !Array.isArray(instanceProperties.sentience)
      ? (instanceProperties.sentience as Record<string, unknown>)
      : null;
  const abilityPenalties =
    instanceProperties.abilityPenalties != null &&
    typeof instanceProperties.abilityPenalties === "object" &&
    !Array.isArray(instanceProperties.abilityPenalties)
      ? (instanceProperties.abilityPenalties as Record<string, unknown>)
      : null;

  const beneficial = [
    ...readRolledList(artifactRandom?.minorBeneficial),
    ...readRolledList(artifactRandom?.majorBeneficial),
  ];
  const detrimental = [
    ...readRolledList(artifactRandom?.minorDetrimental),
    ...readRolledList(artifactRandom?.majorDetrimental),
  ];

  const penaltyParts = abilityPenalties
    ? Object.entries(abilityPenalties)
        .filter(([, value]) => typeof value === "number" && value !== 0)
        .map(([ability, value]) => `${ability} ${Number(value)}`)
    : [];

  if (!artifactRandom && !sentience && penaltyParts.length === 0) return null;

  return (
    <div className="space-y-2 rounded-md border border-border/60 p-3 text-xs">
      {sentience ? (
        <div className="space-y-1">
          <p className="font-medium text-foreground">Senciência</p>
          <p className="text-muted-foreground">
            {[
              sentience.alignment ? `Alinhamento ${String(sentience.alignment)}` : null,
              typeof sentience.inteligencia === "number"
                ? `INT ${sentience.inteligencia}`
                : null,
              typeof sentience.sabedoria === "number"
                ? `SAB ${sentience.sabedoria}`
                : null,
              typeof sentience.carisma === "number"
                ? `CAR ${sentience.carisma}`
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {sentience.senses ? (
            <p className="text-muted-foreground">
              Sentidos: {String(sentience.senses)}
            </p>
          ) : null}
          {sentience.communication ? (
            <p className="text-muted-foreground">
              Comunicação: {String(sentience.communication)}
              {Array.isArray(sentience.languages) && sentience.languages.length > 0
                ? ` (${sentience.languages.map(String).join(", ")})`
                : ""}
            </p>
          ) : null}
          {sentience.purposeSummary ? (
            <p className="text-muted-foreground">
              Propósito: {String(sentience.purposeSummary)}
            </p>
          ) : null}
        </div>
      ) : null}

      {penaltyParts.length > 0 ? (
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            Penalidade de atributo (artefato)
          </p>
          <p className="text-muted-foreground">
            {penaltyParts.join(" · ")} — até Restauração Maior
          </p>
        </div>
      ) : null}

      {beneficial.length > 0 ? (
        <div className="space-y-1">
          <p className="font-medium text-foreground">Propriedades benéficas</p>
          <ul className="list-disc space-y-0.5 pl-4 text-muted-foreground">
            {beneficial.map((prop, index) => (
              <li key={`${prop.slug ?? "b"}-${index}`}>
                {formatRolledPropLabel(prop)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {detrimental.length > 0 ? (
        <div className="space-y-1">
          <p className="font-medium text-foreground">Propriedades prejudiciais</p>
          <ul className="list-disc space-y-0.5 pl-4 text-muted-foreground">
            {detrimental.map((prop, index) => (
              <li key={`${prop.slug ?? "d"}-${index}`}>
                {formatRolledPropLabel(prop)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/** Controles e avisos do item (usado no modal do tile). */
export function InventoryItemDetail({
  item,
  characterId,
  isPending,
  attunementSlotsFull,
  warnings,
  weaponOptions = [],
  baseOptions = [],
  containerOptions = [],
  canBindPactWeapon = false,
  onToggleLocation,
  onToggleAttunement,
  onPatch,
  onRemove,
  onAttachCharm,
  onDetachCharm,
  onAttachCoverage,
  onDetachCoverage,
  sellCreditApplies = false,
}: InventoryItemDetailProps) {
  const [qtyDraft, setQtyDraft] = useState<string | null>(null);
  const [attachWeaponSlug, setAttachWeaponSlug] = useState("");
  const [attachBaseSlug, setAttachBaseSlug] = useState("");
  const [coverageBonus, setCoverageBonus] = useState<"1" | "2" | "3">("1");
  const [enspelledSpellSlug, setEnspelledSpellSlug] = useState("");
  const [boundSpellDraft, setBoundSpellDraft] = useState(
    item.boundSpellSlug ?? "",
  );
  const spellLabels = useSpellLabels();
  const isTransport = isBoardableTransportKind(item.propertiesKind);
  const linkVehicle = useLinkVehicle(characterId ?? "");
  const boardVehicle = useBoardVehicle(characterId ?? "");
  const linkedActors = useCharacterActors(characterId ?? "");
  const linkedTransport = (linkedActors.data ?? []).find(
    (actor) =>
      actor.templateSlug === item.itemSlug &&
      (actor.actorKind === "vehicle" || actor.actorKind === "mount"),
  );
  const sellHint = (() => {
    if (!sellCreditApplies || !item.costText) return null;
    const unit = parseCostTextClient(item.costText);
    if (!unit) return null;
    const half = halfCoinPurseClient(
      scaleCoinPurseClient(unit, item.quantity),
    );
    const label = formatCoinPurse(half);
    return label ? `Vende por ${label}` : null;
  })();
  const coverageEnspelledProfile = ENSPELLED_COVERAGE_PROFILES[item.itemSlug];
  const uniqueEnspelledProfile = ENSPELLED_UNIQUE_PROFILES[item.itemSlug];
  const enspelledSpellOptions = useMemo(() => {
    const profile = coverageEnspelledProfile ?? uniqueEnspelledProfile;
    if (!profile) return [];
    const rows = spellLabels.data?.data ?? [];
    return rows
      .filter(
        (spell) =>
          spell.level <= profile.maxLevel &&
          (profile.schools == null || profile.schools.has(spell.schoolSlug)),
      )
      .map((spell) => ({
        value: spell.slug,
        label: `${spell.name} (${spell.level === 0 ? "Truque" : `${spell.level}º`} · ${spell.schoolName})`,
      }));
  }, [
    coverageEnspelledProfile,
    uniqueEnspelledProfile,
    spellLabels.data?.data,
  ]);
  const qtyDisplay = qtyDraft ?? String(item.quantity);
  const qtyId = `qty-${item.itemSlug}`;
  const slotId = `slot-${item.itemSlug}`;
  const equipped = item.location === "equipped";
  const cursedBlocksUnattune =
    Boolean(item.cursed) && item.attuned && !item.curseBroken;
  const canAttune =
    item.requiresAttunement &&
    (item.attuned ? !cursedBlocksUnattune : !attunementSlotsFull);
  const showAttach =
    isWeaponCharmSlug(item.itemSlug) &&
    item.location === "backpack" &&
    Boolean(onAttachCharm) &&
    weaponOptions.length > 0;
  const showAttachCoverage =
    Boolean(item.isCoverage) &&
    item.location === "backpack" &&
    Boolean(onAttachCoverage) &&
    hostsForCoverageSlug(item.itemSlug, baseOptions).length > 0;
  const coverageHostOptions = hostsForCoverageSlug(
    item.itemSlug,
    baseOptions,
  );
  const showDetach =
    Boolean(item.attachedCharmSlug) && Boolean(onDetachCharm);
  const showDetachCoverage =
    Boolean(item.attachedCoverageSlug) && Boolean(onDetachCoverage);
  const canAttuneCoverage =
    Boolean(item.attachedCoverageRequiresAttunement) &&
    (item.attachedCoverageAttuned || !attunementSlotsFull);
  const showPactWeapon =
    canBindPactWeapon && item.itemType === "weapon";
  const isPactWeapon = Boolean(item.isPactWeapon);

  function commitQuantity(nextRaw: number) {
    const next = Math.max(1, Math.trunc(nextRaw) || 1);
    setQtyDraft(null);
    if (next !== item.quantity) {
      onPatch(item.itemSlug, { quantity: next });
    }
  }

  const effectsLabel =
    item.requiresAttunement || item.itemType === "other"
      ? effectsStatusLabel(item.effectsStatus)
      : null;

  return (
    <div className="space-y-4">
      <ItemCatalogDescriptionBlock slug={item.itemSlug} itemType={item.itemType} />

      {effectsLabel ? (
        <p
          className={cn(
            "text-sm font-medium",
            item.effectsActive ? "text-secondary" : "text-muted-foreground",
          )}
        >
          Efeitos: {effectsLabel}
        </p>
      ) : null}

      {item.attachedCharmName ? (
        <p className="text-xs text-muted-foreground">
          Encanto: {item.attachedCharmName}
        </p>
      ) : null}

      {item.attachedCoverageName ? (
        <p className="text-xs text-muted-foreground">
          Cobertura: {item.attachedCoverageName}
          {item.attachedCoverageBonus
            ? ` (+${item.attachedCoverageBonus})`
            : ""}
          {item.attachedCoverageRequiresAttunement
            ? item.attachedCoverageAttuned
              ? " · sintonizada"
              : " · exige sintonia"
            : null}
          {item.attachedCoverageSpellSlug
            ? ` · ${item.attachedCoverageSpellSlug}`
            : null}
        </p>
      ) : null}
      {item.boundSpellSlug ? (
        <p className="text-xs text-muted-foreground">
          Magia vinculada: {item.boundSpellSlug}
        </p>
      ) : null}

      <InstancePropertiesSummary instanceProperties={item.instanceProperties} />

      {containerOptions.length > 0 && item.location === "backpack" ? (
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground">
            Recipiente
          </p>
          <SearchableSelect
            id={`container-${item.itemSlug}`}
            value={item.containedInItemSlug ?? ""}
            onValueChange={(next) =>
              onPatch(item.itemSlug, {
                containedInItemSlug: next.trim() ? next : null,
              })
            }
            options={[
              { value: "", label: "Mochila (raiz)" },
              ...containerOptions.filter((c) => c.value !== item.itemSlug),
            ]}
            placeholder="Onde guardar…"
            disabled={isPending}
          />
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <ul className="space-y-1">
          {warnings.map((warning) => (
            <li
              key={`${warning.code}-${warning.message}`}
              className="inline-flex max-w-full items-start gap-1 rounded border border-secondary/30 bg-secondary/10 px-1.5 py-0.5 text-[0.65rem] leading-snug text-secondary"
            >
              <ShieldExclamationIcon
                className="mt-0.5 size-3 shrink-0"
                aria-hidden
              />
              <span>{warning.message}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
            Qtd
          </span>
          <QuantityStepper
            id={qtyId}
            value={qtyDisplay}
            onChange={setQtyDraft}
            onCommit={commitQuantity}
            disabled={isPending}
            ariaLabel={`Quantidade de ${item.itemName}`}
          />
        </div>

        {equipped ? (
          <label className="flex items-center gap-1.5">
            <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
              Slot
            </span>
            <SearchableSelect
              id={slotId}
              aria-label={`Slot de ${item.itemName}`}
              className="h-7 w-auto min-w-[9rem] text-xs"
              value={item.equipmentSlot ?? ""}
              disabled={isPending}
              placeholder="Escolher…"
              options={[
                ...(!item.equipmentSlot
                  ? [{ value: "", label: "Escolher…" }]
                  : []),
                ...SLOT_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                })),
              ]}
              onValueChange={(next) => {
                if (!next) return;
                onPatch(item.itemSlug, {
                  equipmentSlot: next as EquipmentSlot,
                });
              }}
            />
          </label>
        ) : null}
      </div>

      {showAttach ? (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-[10rem] flex-1 flex-col gap-1">
            <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
              Prender em
            </span>
            <SearchableSelect
              id={`attach-${item.itemSlug}`}
              aria-label={`Arma para ${item.itemName}`}
              className="h-7 text-xs"
              value={attachWeaponSlug}
              disabled={isPending}
              placeholder="Escolher arma…"
              options={weaponOptions}
              onValueChange={setAttachWeaponSlug}
            />
          </label>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isPending || !attachWeaponSlug}
            onClick={() => {
              if (!attachWeaponSlug || !onAttachCharm) return;
              onAttachCharm(attachWeaponSlug, item.itemSlug);
            }}
          >
            Prender
          </Button>
        </div>
      ) : null}

      {showAttachCoverage ? (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-[10rem] flex-1 flex-col gap-1">
            <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
              Aplicar em
            </span>
            <SearchableSelect
              id={`coverage-attach-${item.itemSlug}`}
              aria-label={`Peça base para ${item.itemName}`}
              className="h-7 text-xs"
              value={attachBaseSlug}
              disabled={isPending}
              placeholder="Escolher peça…"
              options={coverageHostOptions}
              onValueChange={setAttachBaseSlug}
            />
          </label>
          {coverageNeedsTier(item.itemSlug) ? (
            <label className="flex flex-col gap-1">
              <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
                Bônus
              </span>
              <SearchableSelect
                id={`coverage-bonus-${item.itemSlug}`}
                aria-label="Tier da cobertura"
                className="h-7 w-20 text-xs"
                value={coverageBonus}
                disabled={isPending}
                options={[
                  { value: "1", label: "+1" },
                  { value: "2", label: "+2" },
                  { value: "3", label: "+3" },
                ]}
                onValueChange={(next) => {
                  if (next === "1" || next === "2" || next === "3") {
                    setCoverageBonus(next);
                  }
                }}
              />
            </label>
          ) : null}
          {coverageEnspelledProfile ? (
            <label className="flex min-w-[12rem] flex-1 flex-col gap-1">
              <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
                Magia vinculada
              </span>
              <SearchableSelect
                id={`coverage-spell-${item.itemSlug}`}
                aria-label={`Magia de ${item.itemName}`}
                className="h-7 text-xs"
                value={enspelledSpellSlug}
                disabled={isPending || spellLabels.isPending}
                placeholder="Escolher magia…"
                options={enspelledSpellOptions}
                onValueChange={setEnspelledSpellSlug}
              />
            </label>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={
              isPending ||
              !attachBaseSlug ||
              (Boolean(coverageEnspelledProfile) && !enspelledSpellSlug)
            }
            onClick={() => {
              if (!attachBaseSlug || !onAttachCoverage) return;
              onAttachCoverage(
                attachBaseSlug,
                item.itemSlug,
                coverageNeedsTier(item.itemSlug)
                  ? (Number(coverageBonus) as 1 | 2 | 3)
                  : undefined,
                coverageEnspelledProfile ? enspelledSpellSlug : undefined,
              );
            }}
          >
            Aplicar
          </Button>
        </div>
      ) : null}

      {uniqueEnspelledProfile ? (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1">
            <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
              Magia vinculada
            </span>
            <SearchableSelect
              id={`bound-spell-${item.itemSlug}`}
              aria-label={`Magia de ${item.itemName}`}
              className="h-7 text-xs"
              value={boundSpellDraft}
              disabled={isPending || spellLabels.isPending}
              placeholder="Escolher magia…"
              options={enspelledSpellOptions}
              onValueChange={setBoundSpellDraft}
            />
          </label>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isPending || !boundSpellDraft}
            onClick={() =>
              onPatch(item.itemSlug, { boundSpellSlug: boundSpellDraft })
            }
          >
            Vincular
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {item.requiresAttunement ? (
          <Button
            type="button"
            variant={item.attuned ? "secondary" : "outline"}
            size="sm"
            className="gap-1"
            disabled={isPending || !canAttune}
            title={
              cursedBlocksUnattune
                ? "Amaldiçoado — Remover Maldição para dessintonizar"
                : !canAttune && !item.attuned
                  ? `Limite de ${MAX_ATTUNED_ITEMS} sintonias atingido`
                  : item.attuned
                    ? "Dessintonizar"
                    : "Sintonizar"
            }
            onClick={() => onToggleAttunement(item)}
          >
            {item.attuned ? (
              <LinkSlashIcon className="size-3.5" aria-hidden />
            ) : (
              <LinkIcon className="size-3.5" aria-hidden />
            )}
            {item.attuned ? "Dessintonizar" : "Sintonizar"}
          </Button>
        ) : null}
        {showPactWeapon ? (
          <Button
            type="button"
            variant={isPactWeapon ? "secondary" : "outline"}
            size="sm"
            className="gap-1"
            disabled={isPending}
            title={
              isPactWeapon
                ? "Remover vínculo de Arma de Pacto"
                : "Marcar como Arma de Pacto"
            }
            onClick={() =>
              onPatch(item.itemSlug, { pactWeapon: !isPactWeapon })
            }
          >
            {isPactWeapon ? "Remover vínculo" : "Arma de Pacto"}
          </Button>
        ) : null}
        {isTransport && characterId ? (
          <>
            <Button
              type="button"
              variant={linkedTransport ? "outline" : "secondary"}
              size="sm"
              className="gap-1"
              disabled={
                isPending ||
                linkVehicle.isPending ||
                boardVehicle.isPending ||
                Boolean(linkedTransport)
              }
              onClick={() =>
                linkVehicle.mutate({ itemSlug: item.itemSlug })
              }
            >
              {linkedTransport ? "Já vinculado" : "Vincular"}
            </Button>
            {linkedTransport ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isPending || boardVehicle.isPending}
                  onClick={() => boardVehicle.mutate(linkedTransport.id)}
                >
                  Entrar
                </Button>
                <Link
                  href={`/actors/${linkedTransport.id}`}
                  className="inline-flex items-center text-xs font-medium text-primary underline-offset-2 hover:underline"
                >
                  Abrir ficha
                </Link>
              </>
            ) : null}
            {linkVehicle.isError ? (
              <p className="basis-full text-xs text-destructive">
                {(linkVehicle.error as Error)?.message ??
                  "Falha ao vincular transporte"}
              </p>
            ) : null}
          </>
        ) : (
          <Button
            type="button"
            variant={equipped ? "outline" : "secondary"}
            size="sm"
            className="gap-1"
            disabled={isPending}
            onClick={() => onToggleLocation(item)}
          >
            {equipped ? (
              <ArrowDownTrayIcon className="size-3.5" aria-hidden />
            ) : (
              <ArrowUpTrayIcon className="size-3.5" aria-hidden />
            )}
            {equipped ? "Desequipar" : "Equipar"}
          </Button>
        )}
        {showDetach ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => onDetachCharm?.(item.itemSlug)}
          >
            Remover encanto
          </Button>
        ) : null}
        {showDetachCoverage ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => onDetachCoverage?.(item.itemSlug)}
          >
            Remover cobertura
          </Button>
        ) : null}
        {item.attachedCoverageRequiresAttunement ? (
          <Button
            type="button"
            variant={item.attachedCoverageAttuned ? "secondary" : "outline"}
            size="sm"
            className="gap-1"
            disabled={isPending || !canAttuneCoverage}
            title={
              !canAttuneCoverage && !item.attachedCoverageAttuned
                ? `Limite de ${MAX_ATTUNED_ITEMS} sintonias atingido`
                : item.attachedCoverageAttuned
                  ? "Dessintonizar cobertura"
                  : "Sintonizar cobertura"
            }
            onClick={() =>
              onPatch(item.itemSlug, {
                attachedCoverageAttuned: !item.attachedCoverageAttuned,
              })
            }
          >
            {item.attachedCoverageAttuned ? (
              <LinkSlashIcon className="size-3.5" aria-hidden />
            ) : (
              <LinkIcon className="size-3.5" aria-hidden />
            )}
            {item.attachedCoverageAttuned
              ? "Dessintonizar cobertura"
              : "Sintonizar cobertura"}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={isPending}
          title={sellHint ?? undefined}
          onClick={() => onRemove(item.itemSlug)}
        >
          <TrashIcon className="size-3.5" aria-hidden />
          {sellCreditApplies ? "Vender / descartar" : "Remover"}
        </Button>
      </div>
      {item.consumable ? (
        <p className="text-[11px] text-muted-foreground">
          Consumível — ao usar (poção etc.), o efeito aparece nas ações de
          economia / mesa; a quantidade diminui.
        </p>
      ) : null}
    </div>
  );
}

export function inventoryItemTileMeta(item: InventoryItem): {
  subtitle: string;
  badge: string;
  accent: boolean;
} {
  const typeLabel = itemTypeLabel(item.itemType);
  const equipped = item.location === "equipped";
  const slotLabel =
    equipped && item.equipmentSlot
      ? (SLOT_LABELS[item.equipmentSlot] ?? item.equipmentSlot)
      : null;
  const parts = [
    item.quantity > 1 ? `×${item.quantity}` : null,
    item.isPactWeapon ? "Arma de Pacto" : null,
    item.attuned
      ? "Sintonizado"
      : item.requiresAttunement
        ? "Exige sintonia"
        : null,
    item.attachedCharmName ? `Encanto: ${item.attachedCharmName}` : null,
    item.attachedCoverageName
      ? `Cobertura: ${item.attachedCoverageName}${
          item.attachedCoverageBonus ? ` (+${item.attachedCoverageBonus})` : ""
        }${
          item.attachedCoverageRequiresAttunement
            ? item.attachedCoverageAttuned
              ? " · sintonizada"
              : " · sem sintonia"
            : ""
        }`
      : null,
  ].filter(Boolean);

  return {
    badge: item.isPactWeapon
      ? "Pacto"
      : (slotLabel ?? typeLabel),
    subtitle: parts.length > 0 ? parts.join(" · ") : typeLabel,
    accent:
      equipped ||
      item.attuned ||
      Boolean(item.isPactWeapon) ||
      Boolean(item.attachedCharmSlug) ||
      Boolean(item.attachedCoverageSlug),
  };
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { sessionCombatStatusLines } from "@/features/character/character-sheet/lib/combat/session-combat-status";
import { useSpellLabels } from "@/features/catalog/spell-catalog/api/use-spells";
import type { SkirmishAttackResult } from "@/features/skirmish/skirmishes/api/skirmishes.api";
import {
  useDeleteSkirmish,
  useEndSkirmishTurn,
  useFinishSkirmish,
  useSkirmish,
  useSkirmishAttack,
  useSkirmishCast,
} from "@/features/skirmish/skirmishes/api/use-skirmishes";
import {
  remainingSpellSlotsFromMap,
  visibleSkirmishAttackFlagsFromSheet,
} from "@/features/skirmish/skirmishes/lib/skirmish-attack-flag-availability";
import { incomingHitFromLogLine } from "@/features/skirmish/skirmishes/lib/skirmish-combat-playback";
import type { SkirmishAttackFlagsState } from "@/features/skirmish/skirmishes/ui/detail/skirmish-attack-flags";
import { attackPayloadFromFlags } from "@/features/skirmish/skirmishes/ui/detail/skirmish-attack-flags";
import {
  SkirmishAttackPanel,
  type SkirmishAdvantageMode,
} from "@/features/skirmish/skirmishes/ui/detail/skirmish-attack-panel";
import { SkirmishCastPanel } from "@/features/skirmish/skirmishes/ui/detail/skirmish-cast-panel";
import { SkirmishCombatHeader } from "@/features/skirmish/skirmishes/ui/detail/skirmish-combat-header";
import { SkirmishCombatLog } from "@/features/skirmish/skirmishes/ui/detail/skirmish-combat-log";
import { SkirmishDetailSkeleton } from "@/features/skirmish/skirmishes/ui/detail/skirmish-detail-skeleton";
import { SkirmishHpStrip } from "@/features/skirmish/skirmishes/ui/detail/skirmish-hp-strip";
import { SkirmishOutcomeBanner } from "@/features/skirmish/skirmishes/ui/detail/skirmish-outcome-banner";
import { SkirmishSheetKit } from "@/features/skirmish/skirmishes/ui/detail/skirmish-sheet-kit";
import { SkirmishTurnBar } from "@/features/skirmish/skirmishes/ui/detail/skirmish-turn-bar";
import { SkirmishWorkspaceTabs } from "@/features/skirmish/skirmishes/ui/detail/skirmish-workspace-tabs";
import { useSkirmishLogPlayback } from "@/features/skirmish/skirmishes/ui/detail/use-skirmish-log-playback";
import { useSkirmishSheetCombat } from "@/features/skirmish/skirmishes/ui/detail/use-skirmish-sheet-combat";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/ui/back-link";
import { EmptyMapMark } from "@/shared/ui/brand-marks";
import { EmptyState } from "@/shared/ui/empty-state";

export function SkirmishDetailView({ skirmishId }: { skirmishId: string }) {
  const query = useSkirmish(skirmishId);
  const attack = useSkirmishAttack(skirmishId);
  const cast = useSkirmishCast(skirmishId);
  const endTurn = useEndSkirmishTurn(skirmishId);
  const finish = useFinishSkirmish(skirmishId);
  const remove = useDeleteSkirmish({ goToList: true });
  const {
    character,
    stateQuery,
    mechanicalCatalog,
    economyActions,
  } = useSkirmishSheetCombat(query.data?.characterId ?? "");
  const spellLabels = useSpellLabels({
    enabled: (query.data?.mySpells.length ?? 0) > 0,
  });
  const [weaponKey, setWeaponKey] = useState("");
  const [spellSlug, setSpellSlug] = useState("");
  const [spellSlotLevel, setSpellSlotLevel] = useState(1);
  const [advantage, setAdvantage] = useState<SkirmishAdvantageMode>("normal");
  const [flags, setFlags] = useState<SkirmishAttackFlagsState>({});
  const [last, setLast] = useState<SkirmishAttackResult | null>(null);
  const logEndRef = useRef<HTMLLIElement | null>(null);

  const skirmish = query.data;
  const playback = useSkirmishLogPlayback(
    skirmish?.combatLog ?? [],
    Boolean(skirmish),
  );
  const pc = skirmish?.combatants.find((row) => row.kind === "pc");
  const actor = skirmish?.combatants.find((row) => row.kind === "actor");
  const frozenCombatants = useRef(skirmish?.combatants ?? []);
  if (!playback.playing && skirmish) {
    frozenCombatants.current = skirmish.combatants;
  }
  const shownCombatants = playback.playing
    ? frozenCombatants.current
    : (skirmish?.combatants ?? []);
  const shownPc = shownCombatants.find((row) => row.kind === "pc");
  const shownActor = shownCombatants.find((row) => row.kind === "actor");

  const sheetWeapons = character?.weaponAttacks ?? [];
  const weaponOptions = useMemo(() => {
    if (sheetWeapons.length > 0) {
      return sheetWeapons.map((row) => ({
        value: `${row.itemSlug}:${row.mode}`,
        label: `${row.itemName} (${row.mode === "melee" ? "corpo a corpo" : "à distância"}) ${row.attackBonus >= 0 ? "+" : ""}${row.attackBonus}`,
      }));
    }
    return (skirmish?.myWeapons ?? []).map((row) => ({
      value: `${row.itemSlug}:${row.mode}`,
      label: `${row.itemSlug} (${row.mode === "melee" ? "corpo a corpo" : "à distância"})`,
    }));
  }, [sheetWeapons, skirmish?.myWeapons]);

  const selectedSheetWeapon = sheetWeapons.find(
    (row) => `${row.itemSlug}:${row.mode}` === weaponKey,
  );
  const selectedListedWeapon = (skirmish?.myWeapons ?? []).find(
    (row) => `${row.itemSlug}:${row.mode}` === weaponKey,
  );

  useEffect(() => {
    if (weaponKey) return;
    const first = weaponOptions[0]?.value;
    if (first) setWeaponKey(first);
  }, [weaponKey, weaponOptions]);

  const visibleFlagKeys = useMemo(() => {
    if (!character) return [];
    return visibleSkirmishAttackFlagsFromSheet({
      character,
      catalog: mechanicalCatalog.data,
      economyActions,
      weapon: selectedSheetWeapon ?? null,
      state: stateQuery.data,
    });
  }, [
    character,
    selectedSheetWeapon,
    stateQuery.data,
    economyActions,
    mechanicalCatalog.data,
  ]);

  const spellSlots = useMemo(
    () => remainingSpellSlotsFromMap(stateQuery.data?.spellSlotsRemaining),
    [stateQuery.data?.spellSlotsRemaining],
  );

  const spellLabelBySlug = useMemo(() => {
    const map = new Map<string, { name: string; level: number }>();
    for (const row of spellLabels.data?.data ?? []) {
      map.set(row.slug, { name: row.name, level: row.level });
    }
    return map;
  }, [spellLabels.data?.data]);

  const spellOptions = useMemo(() => {
    return (skirmish?.mySpells ?? [])
      .map((row) => {
        const meta = spellLabelBySlug.get(row.spellSlug);
        const level = meta?.level ?? 0;
        const name = meta?.name ?? row.spellSlug.replace(/-/g, " ");
        const circle =
          level === 0 ? "Truque" : `${level}º`;
        return {
          value: row.spellSlug,
          label: `${name} (${circle})`,
          level,
        };
      })
      .sort((a, b) => a.level - b.level || a.label.localeCompare(b.label, "pt"));
  }, [skirmish?.mySpells, spellLabelBySlug]);

  useEffect(() => {
    if (spellSlug) return;
    const preferred =
      spellOptions.find((row) => row.value === "raio-de-fogo") ??
      spellOptions.find((row) => row.level === 0) ??
      spellOptions[0];
    if (preferred) setSpellSlug(preferred.value);
  }, [spellSlug, spellOptions]);

  useEffect(() => {
    const selected = spellOptions.find((row) => row.value === spellSlug);
    if (!selected || selected.level === 0) return;
    const usable = spellSlots.filter((slot) => slot.level >= selected.level);
    if (usable.length === 0) return;
    if (usable.some((slot) => slot.level === spellSlotLevel)) return;
    setSpellSlotLevel(usable[0].level);
  }, [spellSlug, spellOptions, spellSlots, spellSlotLevel]);

  useEffect(() => {
    if (!visibleFlagKeys.includes("divineSmite")) return;
    if (flags.smiteSlotLevel != null) return;
    const first = spellSlots[0]?.level;
    if (first != null) {
      setFlags((current) => ({ ...current, smiteSlotLevel: first }));
    }
  }, [visibleFlagKeys, spellSlots, flags.smiteSlotLevel]);

  const attacksLeft = skirmish?.turnAttacksRemaining;
  const creatureActing = endTurn.isPending || playback.playing;
  const canAttack =
    Boolean(skirmish?.myTurn) &&
    !creatureActing &&
    Boolean(pc) &&
    Boolean(actor) &&
    !attack.isPending &&
    (attacksLeft == null || attacksLeft > 0);

  const pcTookHit = Boolean(
    playback.latest &&
      actor &&
      pc &&
      incomingHitFromLogLine(
        playback.latest.text,
        actor.displayName,
        pc.displayName,
      ),
  );

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [playback.revealed.length]);

  const statusLines = sessionCombatStatusLines(stateQuery.data);

  const runAttack = () => {
    if (!pc || !actor || !skirmish) return;
    attack.mutate(
      {
        attackerCombatantId: pc.id,
        targetCombatantId: actor.id,
        advantage: advantage === "normal" ? undefined : advantage,
        itemSlug:
          selectedSheetWeapon?.itemSlug ?? selectedListedWeapon?.itemSlug,
        mode: selectedSheetWeapon?.mode ?? selectedListedWeapon?.mode,
        ...attackPayloadFromFlags(flags, visibleFlagKeys),
      },
      { onSuccess: (result) => setLast(result) },
    );
  };

  if (query.isPending) {
    return <SkirmishDetailSkeleton />;
  }

  if (query.isError || !skirmish) {
    return (
      <div className={cn("space-y-3", motion.enter)}>
        <BackLink href="/skirmishes">Skirmishes</BackLink>
        <EmptyState
          icon={<EmptyMapMark className="size-14" />}
          title="Combate não encontrado"
          description={
            query.error instanceof Error
              ? query.error.message
              : "Volte à lista e abra o skirmish de novo."
          }
        />
      </div>
    );
  }

  const title = `${skirmish.characterName}${
    skirmish.opponentName ? ` vs ${skirmish.opponentName}` : ""
  }`;

  const finished = skirmish.status === "finished" && !playback.playing;
  const outcomeTone =
    skirmish.winnerKind === "pc"
      ? "victory"
      : skirmish.winnerKind === "actor"
        ? "defeat"
        : "neutral";
  const outcomeTitle =
    skirmish.winnerKind === "pc"
      ? "Vitória"
      : skirmish.winnerKind === "actor"
        ? "Derrota"
        : "Encerrado";
  const outcomeSubtitle = [
    skirmish.opponentName
      ? skirmish.winnerKind === "pc"
        ? `${skirmish.opponentName} derrotado`
        : skirmish.winnerKind === "actor"
          ? `${skirmish.characterName} caiu`
          : skirmish.opponentName
      : null,
    `Rodada ${skirmish.round}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const hiddenTabs =
    spellOptions.length === 0
      ? (["magic"] as const)
      : ([] as const);
  const defaultTab =
    finished
      ? "log"
      : character?.classSlug === "wizard" && spellOptions.length > 0
        ? "magic"
        : "strike";

  return (
    <div
      className={cn(
        "flex min-h-[calc(100dvh-8rem)] flex-col gap-3",
        motion.enter,
      )}
    >
      <SkirmishCombatHeader
        title={title}
        status={skirmish.status}
        round={skirmish.round}
        finishPending={finish.isPending}
        removePending={remove.isPending}
        onFinish={() => finish.mutate()}
        onRemove={() => remove.mutate(skirmish.id)}
      />

      <SkirmishHpStrip
        pc={pc}
        actor={actor}
        pcHp={shownPc?.hpCurrent ?? pc?.hpCurrent ?? 0}
        actorHp={shownActor?.hpCurrent ?? actor?.hpCurrent ?? 0}
        pcTookHit={pcTookHit}
        actorActing={creatureActing}
        pcWinner={skirmish.winnerKind === "pc" && finished}
        actorWinner={skirmish.winnerKind === "actor" && finished}
      />

      {finished ? (
        <SkirmishOutcomeBanner
          title={outcomeTitle}
          subtitle={outcomeSubtitle}
          tone={outcomeTone}
        />
      ) : skirmish.status === "active" ? (
        <SkirmishTurnBar
          myTurn={skirmish.myTurn}
          creatureActing={creatureActing}
          creatureStatusText={
            endTurn.isPending
              ? "A criatura age…"
              : (playback.latest?.text ?? "Resolvendo o turno da criatura…")
          }
          round={skirmish.round}
          attacksRemaining={attacksLeft ?? null}
          attacksPerAction={skirmish.fighter?.attacksPerAction ?? null}
          statusLines={statusLines}
          canAttack={canAttack}
          attackPending={attack.isPending}
          endTurnPending={endTurn.isPending}
          onAttack={runAttack}
          onEndTurn={() => endTurn.mutate()}
        />
      ) : null}

      <SkirmishWorkspaceTabs
        className="min-h-[16rem] flex-1"
        defaultTab={defaultTab}
        hiddenTabs={[...hiddenTabs]}
        panels={{
          strike: (
            <SkirmishAttackPanel
              myTurn={skirmish.myTurn}
              creatureActing={creatureActing}
              finished={finished}
              weaponKey={weaponKey}
              weaponOptions={weaponOptions}
              onWeaponChange={setWeaponKey}
              advantage={advantage}
              onAdvantageChange={setAdvantage}
              visibleFlagKeys={visibleFlagKeys}
              flags={flags}
              onFlagsChange={setFlags}
              smiteSlots={spellSlots}
              last={creatureActing ? null : last}
              attackError={
                attack.isError
                  ? attack.error instanceof Error
                    ? attack.error.message
                    : "Falha ao resolver o ataque"
                  : null
              }
              endTurnError={
                endTurn.isError
                  ? endTurn.error instanceof Error
                    ? endTurn.error.message
                    : "Falha ao passar o turno"
                  : null
              }
              finishError={
                finish.isError
                  ? finish.error instanceof Error
                    ? finish.error.message
                    : "Falha ao encerrar o combate"
                  : null
              }
            />
          ),
          magic: (
            <SkirmishCastPanel
              myTurn={skirmish.myTurn}
              creatureActing={creatureActing}
              spellSlug={spellSlug}
              spellOptions={spellOptions}
              onSpellChange={setSpellSlug}
              spellSlotLevel={spellSlotLevel}
              onSlotLevelChange={setSpellSlotLevel}
              slots={spellSlots}
              spellSaveDc={character?.spellSaveDc}
              spellAttackBonus={character?.spellAttackBonus}
              castPending={cast.isPending}
              castError={
                cast.isError
                  ? cast.error instanceof Error
                    ? cast.error.message
                    : "Falha ao conjurar"
                  : null
              }
              onCast={() => {
                const selected = spellOptions.find(
                  (row) => row.value === spellSlug,
                );
                const isCantrip = (selected?.level ?? 0) === 0;
                cast.mutate({
                  spellSlug,
                  slotLevel: isCantrip ? undefined : spellSlotLevel,
                });
              }}
            />
          ),
          sheet: (
            <SkirmishSheetKit
              characterId={skirmish.characterId}
              skirmishId={skirmish.id}
            />
          ),
          log: (
            <SkirmishCombatLog
              entries={playback.revealed}
              baseline={playback.baseline}
              endRef={logEndRef}
            />
          ),
        }}
      />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";

import type { CharacterSummary } from "@/entities/character/types";
import { type CampaignCharacterSummary } from "@/features/campaign/campaigns/api/campaigns.api";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";
import { EmptyScrollMark } from "@/shared/ui/brand-marks";
import { Button, buttonVariants } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { SearchableSelect } from "@/shared/ui/searchable-select";

type CampaignLinkCharacterMutation = {
  isPending: boolean;
  isError: boolean;
  error: unknown;
  mutate: (
    characterId: string,
    options?: { onSuccess?: () => void },
  ) => void;
};

type CampaignUnlinkCharacterMutation = {
  isPending: boolean;
  mutate: (characterId: string) => void;
};

type CampaignCharactersSectionProps = {
  characters: CampaignCharacterSummary[];
  available: CharacterSummary[];
  myCharactersCount: number | undefined;
  link: CampaignLinkCharacterMutation;
  unlink: CampaignUnlinkCharacterMutation;
};

export function CampaignCharactersSection({
  characters,
  available,
  myCharactersCount,
  link,
  unlink,
}: CampaignCharactersSectionProps) {
  const [selectedCharacterId, setSelectedCharacterId] = useState("");

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-semibold">Personagens</h2>
        <p className="text-sm text-muted-foreground">
          Fichas vinculadas à mesa. Continuam em{" "}
          <Link href="/characters" className="underline underline-offset-2">
            Minhas fichas
          </Link>
          .
        </p>
      </div>

      {characters.length === 0 ? (
        <EmptyState
          className="py-8"
          icon={<EmptyScrollMark className="size-12" />}
          title="Nenhum personagem ainda"
          description="Vincule uma ficha sua para aparecer na mesa e no encontro."
        />
      ) : (
        <ul
          className={cn(
            "divide-y divide-border overflow-hidden rounded-xl border border-border/80 bg-card/45",
            motion.stagger,
          )}
        >
          {characters.map((character) => (
            <li
              key={character.characterId}
              className={cn(
                "flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
                motion.hoverRow,
              )}
            >
              <div className="min-w-0">
                <p className="font-medium">{character.name}</p>
                <p className="text-sm text-muted-foreground">
                  Nv. {character.level} · {character.speciesSlug} ·{" "}
                  {character.classSlug}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/characters/${character.characterId}`}
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" }),
                  )}
                >
                  Abrir ficha
                </Link>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={unlink.isPending}
                  onClick={() => unlink.mutate(character.characterId)}
                >
                  Desvincular
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {available.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/15 p-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Vincular minha ficha</span>
            <SearchableSelect
              className="h-9"
              value={selectedCharacterId}
              placeholder="Escolher…"
              options={[
                { value: "", label: "Escolher…" },
                ...available.map((character) => ({
                  value: character.id,
                  label: character.name,
                })),
              ]}
              onValueChange={setSelectedCharacterId}
            />
          </label>
          <Button
            type="button"
            disabled={!selectedCharacterId || link.isPending}
            onClick={() => {
              if (!selectedCharacterId) return;
              link.mutate(selectedCharacterId, {
                onSuccess: () => setSelectedCharacterId(""),
              });
            }}
          >
            Vincular
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {myCharactersCount
            ? "Todas as suas fichas já estão nesta campanha."
            : "Crie uma ficha para vincular."}
        </p>
      )}
      {link.isError ? (
        <p className="text-sm text-destructive">
          {link.error instanceof Error ? link.error.message : "Erro ao vincular"}
        </p>
      ) : null}
    </section>
  );
}

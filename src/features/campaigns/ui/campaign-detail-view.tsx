"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useCharacters } from "@/features/characters/api/use-characters";
import { campaignRoleLabel } from "@/features/campaigns/api/campaigns.api";
import {
  useCampaign,
  useDeleteCampaign,
  useLinkCampaignCharacter,
  useUnlinkCampaignCharacter,
} from "@/features/campaigns/api/use-campaigns";
import { cn } from "@/shared/lib/utils";
import { Button, buttonVariants } from "@/shared/ui/button";

export function CampaignDetailView({ campaignId }: { campaignId: string }) {
  const { data, isPending, isError, error } = useCampaign(campaignId);
  const { data: myCharacters } = useCharacters();
  const link = useLinkCampaignCharacter(campaignId);
  const unlink = useUnlinkCampaignCharacter(campaignId);
  const remove = useDeleteCampaign();
  const [selectedCharacterId, setSelectedCharacterId] = useState("");

  const linkedIds = useMemo(
    () => new Set(data?.characters.map((c) => c.characterId) ?? []),
    [data?.characters],
  );

  const available = (myCharacters ?? []).filter((c) => !linkedIds.has(c.id));

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando campanha…</p>;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Campanha não encontrada"}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {data.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Seu papel: {campaignRoleLabel(data.myRole)}
            </p>
          </div>
          <Link
            href="/campaigns"
            className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
          >
            Voltar
          </Link>
        </div>
        {data.description ? (
          <p className="text-sm text-muted-foreground">{data.description}</p>
        ) : null}
        <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm">
          Código de convite:{" "}
          <span className="font-mono font-semibold tracking-wide">
            {data.inviteCode}
          </span>
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Membros</h2>
        <ul className="divide-y divide-border rounded-xl border border-border">
          {data.members.map((member) => (
            <li
              key={member.userId}
              className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
            >
              <span className="font-mono text-xs text-muted-foreground">
                {member.userId.slice(0, 8)}…
              </span>
              <span>{campaignRoleLabel(member.role)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Personagens</h2>
        <p className="text-sm text-muted-foreground">
          Fichas vinculadas à mesa. Continuam em{" "}
          <Link href="/characters" className="underline underline-offset-2">
            Minhas fichas
          </Link>
          .
        </p>

        {data.characters.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum personagem ainda.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {data.characters.map((character) => (
              <li
                key={character.characterId}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              <span className="text-muted-foreground">
                Vincular minha ficha
              </span>
              <select
                className="h-9 rounded-md border border-input bg-background px-3"
                value={selectedCharacterId}
                onChange={(e) => setSelectedCharacterId(e.target.value)}
              >
                <option value="">Escolher…</option>
                {available.map((character) => (
                  <option key={character.id} value={character.id}>
                    {character.name}
                  </option>
                ))}
              </select>
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
            {myCharacters?.length
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

      {data.myRole === "dm" ? (
        <section className="border-t border-border pt-6">
          <Button
            type="button"
            variant="destructive"
            disabled={remove.isPending}
            onClick={() => {
              if (
                window.confirm(
                  `Excluir a campanha "${data.name}"? Os personagens não são apagados.`,
                )
              ) {
                remove.mutate(campaignId);
              }
            }}
          >
            {remove.isPending ? "Excluindo…" : "Excluir campanha"}
          </Button>
        </section>
      ) : null}
    </div>
  );
}

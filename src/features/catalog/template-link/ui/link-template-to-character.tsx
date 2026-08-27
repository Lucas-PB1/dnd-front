"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ActorKind } from "@/entities/actor/types";
import {
  actorKeys,
  useSpawnActorFromTemplate,
} from "@/features/actor/api/use-actors";
import { useCharacters } from "@/features/character/characters/api/use-characters";
import { charactersKeys } from "@/features/character/characters/api/characters.api";
import { sessionKeys } from "@/features/character/character-sheet/api/character-session.api";
import {
  boardCharacterVehicle,
  linkCharacterVehicle,
} from "@/features/catalog/creature-template-catalog/api/creature-templates.api";
import { useAuth } from "@/features/auth/model";
import { Button, buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type LinkTemplateToCharacterProps = {
  templateSlug: string;
  templateName: string;
  actorKind: ActorKind;
  loginNext: string;
};

function isBoardableKind(kind: ActorKind): boolean {
  return kind === "vehicle" || kind === "mount";
}

export function LinkTemplateToCharacter({
  templateSlug,
  templateName,
  actorKind,
  loginNext,
}: LinkTemplateToCharacterProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const characters = useCharacters();
  const spawn = useSpawnActorFromTemplate(loginNext);
  const [characterId, setCharacterId] = useState("");
  const [boardAfterLink, setBoardAfterLink] = useState(true);

  const vehicleLink = useMutation({
    mutationFn: async (selectedCharacterId: string) => {
      if (!accessToken) throw new Error("Não autenticado");
      const actor = await linkCharacterVehicle(
        accessToken,
        selectedCharacterId,
        { templateSlug },
      );
      if (boardAfterLink && isBoardableKind(actorKind)) {
        await boardCharacterVehicle(accessToken, selectedCharacterId, {
          actorId: actor.id,
        });
      }
      return { actor, boarded: boardAfterLink && isBoardableKind(actorKind) };
    },
    onSuccess: ({ actor, boarded }, selectedCharacterId) => {
      void queryClient.invalidateQueries({
        queryKey: actorKeys.byCharacter(selectedCharacterId),
      });
      void queryClient.invalidateQueries({
        queryKey: charactersKeys.detail(selectedCharacterId),
      });
      if (boarded) {
        void queryClient.invalidateQueries({
          queryKey: sessionKeys.state(selectedCharacterId),
        });
      }
      queryClient.setQueryData(actorKeys.detail(actor.id), actor);
    },
  });

  if (!accessToken) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(loginNext)}`}
        className={cn(buttonVariants({ variant: "secondary" }))}
      >
        Entrar para adicionar à ficha
      </Link>
    );
  }

  const busy = spawn.isPending || vehicleLink.isPending;
  const error = spawn.error ?? vehicleLink.error;

  async function handleLink() {
    if (!characterId) return;

    if (actorKind === "vehicle") {
      const { actor, boarded } = await vehicleLink.mutateAsync(characterId);
      router.push(
        boarded ? `/characters/${characterId}` : `/actors/${actor.id}`,
      );
      return;
    }

    const actor = await spawn.mutateAsync({
      templateSlug,
      actorKind,
      parentCharacterId: characterId,
    });
    router.push(`/actors/${actor.id}`);
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-muted/20 p-4">
      <div>
        <p className="font-heading text-sm font-semibold">
          Adicionar à ficha do personagem
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Cria uma instância de <strong>{templateName}</strong> vinculada ao
          personagem escolhido (navio, montaria ou companheiro na mesa).
        </p>
      </div>
      {characters.isPending ? (
        <p className="text-sm text-muted-foreground">Carregando personagens…</p>
      ) : !characters.data?.length ? (
        <Link
          href="/characters/new"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Criar personagem
        </Link>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Personagem</span>
              <select
                className="rounded-md border border-border bg-background px-2 py-2"
                value={characterId}
                onChange={(event) => setCharacterId(event.target.value)}
              >
                <option value="">Selecione…</option>
                {characters.data.map((character) => (
                  <option key={character.id} value={character.id}>
                    {character.name}
                  </option>
                ))}
              </select>
            </label>
            <Button
              type="button"
              disabled={!characterId || busy}
              onClick={() => void handleLink()}
            >
              {busy ? "Vinculando…" : "Adicionar à ficha"}
            </Button>
          </div>
          {isBoardableKind(actorKind) ? (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="size-4 rounded border-border"
                checked={boardAfterLink}
                onChange={(event) => setBoardAfterLink(event.target.checked)}
              />
              Entrar a bordo após vincular (aba Ações)
            </label>
          ) : null}
        </div>
      )}
      {error ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Erro ao vincular"}
        </p>
      ) : null}
    </div>
  );
}

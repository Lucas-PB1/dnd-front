"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ActorKind } from "@/entities/actor/types";
import { useCharacters } from "@/features/character/characters/api/use-characters";
import { useSpawnActorFromTemplate } from "@/features/actor/api/use-actors";
import { useAuth } from "@/features/auth/model";
import { Button, buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type LinkTemplateToCharacterProps = {
  templateSlug: string;
  templateName: string;
  actorKind: ActorKind;
  loginNext: string;
};

export function LinkTemplateToCharacter({
  templateSlug,
  templateName,
  actorKind,
  loginNext,
}: LinkTemplateToCharacterProps) {
  const router = useRouter();
  const { accessToken } = useAuth();
  const characters = useCharacters();
  const spawn = useSpawnActorFromTemplate(loginNext);
  const [characterId, setCharacterId] = useState("");

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

  async function handleLink() {
    if (!characterId) return;
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
            disabled={!characterId || spawn.isPending}
            onClick={() => void handleLink()}
          >
            {spawn.isPending ? "Vinculando…" : "Adicionar à ficha"}
          </Button>
        </div>
      )}
      {spawn.isError ? (
        <p className="text-sm text-destructive">
          {spawn.error instanceof Error
            ? spawn.error.message
            : "Erro ao vincular"}
        </p>
      ) : null}
    </div>
  );
}

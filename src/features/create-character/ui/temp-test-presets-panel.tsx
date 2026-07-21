"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ApiError } from "@/shared/api/dnd-api/api-error";
import {
  charactersKeys,
  createCharacter,
} from "@/features/characters/api/characters.api";
import { useAuth } from "@/features/auth/model/use-auth";
import {
  TEMP_TEST_PRESETS,
  applyTempTestPreset,
  type TempAutofillApply,
  type TempTestPreset,
} from "@/features/create-character/lib/TEMP-test-presets";
import { toCreateCharacterPayload } from "@/features/create-character/model/to-create-payload";
import { Button } from "@/shared/ui/button";

type TempTestPresetsPanelProps = {
  /** Se informado, mostra também botões de autopreencher o wizard */
  wizard?: TempAutofillApply;
  /** Após criar, abrir a ficha (padrão) ou ficar na lista */
  openSheetOnCreate?: boolean;
};

export function TempTestPresetsPanel({
  wizard,
  openSheetOnCreate = true,
}: TempTestPresetsPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: async (preset: TempTestPreset) => {
      if (!accessToken) {
        throw new Error("Faça login para criar uma ficha de teste");
      }
      setPendingId(preset.id);
      setError(null);
      try {
        return await createCharacter(
          accessToken,
          toCreateCharacterPayload(preset.values),
        );
      } catch (err) {
        if (err instanceof ApiError && err.isUnauthorized) {
          router.push("/login?next=/characters");
        }
        throw err;
      }
    },
    onSuccess: (character) => {
      queryClient.invalidateQueries({ queryKey: charactersKeys.all });
      setPendingId(null);
      if (openSheetOnCreate) {
        router.push(`/characters/${character.id}`);
      }
    },
    onError: (err) => {
      setPendingId(null);
      setError(
        err instanceof Error ? err.message : "Falha ao criar ficha de teste",
      );
    },
  });

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      role="note"
      className="rounded-md border-2 border-dashed border-amber-500/80 bg-amber-500/15 px-3 py-2"
    >
      <p className="mb-1 text-xs font-semibold tracking-wide text-amber-800 uppercase dark:text-amber-200">
        TEMP · fichas de teste
      </p>
      <p className="mb-2 text-xs text-amber-900/80 dark:text-amber-100/80">
        Cria a ficha direto na API (ou preenche o wizard). Só em development.
      </p>

      <ul className="flex flex-col gap-2">
        {TEMP_TEST_PRESETS.map((preset) => (
          <li
            key={preset.id}
            className="flex flex-wrap items-center gap-2 rounded-md border border-amber-600/40 bg-background/40 px-2 py-1.5"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-amber-950 dark:text-amber-50">
                {preset.label}
              </p>
              <p className="text-[11px] text-amber-900/70 dark:text-amber-100/70">
                {preset.hint}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-amber-600/60 bg-amber-500/20 text-amber-950 hover:bg-amber-500/30 dark:text-amber-50"
                disabled={create.isPending}
                onClick={() => create.mutate(preset)}
              >
                {pendingId === preset.id ? "Criando…" : "Criar ficha"}
              </Button>
              {wizard ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-amber-950 hover:bg-amber-500/20 dark:text-amber-50"
                  disabled={create.isPending}
                  onClick={() => applyTempTestPreset(preset, wizard)}
                >
                  Preencher wizard
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {error ? (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

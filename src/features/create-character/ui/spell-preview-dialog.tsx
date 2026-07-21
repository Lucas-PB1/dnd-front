"use client";

import { useSpellDetail } from "@/features/spell-catalog/api/use-spells";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { PhbProse } from "@/shared/ui/phb-prose";

export type SpellPreviewAction = {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "destructive" | "secondary";
  disabled?: boolean;
};

type SpellPreviewDialogProps = {
  slug: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Ações do rodapé (ex.: selecionar / remover). */
  actions?: SpellPreviewAction[];
};

/** Modal de leitura da magia antes de confirmar a escolha no wizard. */
export function SpellPreviewDialog({
  slug,
  open,
  onOpenChange,
  actions = [],
}: SpellPreviewDialogProps) {
  const { data, isPending, isError, error } = useSpellDetail(slug ?? "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {isPending ? "Carregando…" : (data?.name ?? "Magia")}
          </DialogTitle>
          {data ? (
            <DialogDescription>
              {data.levelLabel} · {data.schoolName}
              {data.concentration ? " · Concentração" : ""}
              {data.ritual ? " · Ritual" : ""}
            </DialogDescription>
          ) : (
            <DialogDescription>
              Detalhes da magia para decidir se vale selecionar.
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {isPending ? (
            <p className="text-sm text-muted-foreground">Carregando magia…</p>
          ) : null}

          {isError || (!isPending && !data) ? (
            <p className="text-sm text-destructive" role="alert">
              {error instanceof Error
                ? error.message
                : "Não foi possível carregar a magia."}
            </p>
          ) : null}

          {data ? (
            <div className="space-y-4">
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs sm:grid-cols-4">
                <Stat label="Tempo" value={data.castingTime} />
                <Stat label="Alcance" value={data.range} />
                <Stat
                  label="Componentes"
                  value={data.componentsLabel ?? "—"}
                />
                <Stat label="Duração" value={data.duration} />
              </dl>

              {data.materialDescription ? (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">
                    Material:{" "}
                  </span>
                  {data.materialDescription}
                </p>
              ) : null}

              <section className="space-y-2">
                <h3 className="text-xs font-medium tracking-wider text-primary uppercase">
                  Descrição
                </h3>
                <div className="border-l-2 border-primary/40 pl-3">
                  <PhbProse
                    text={data.description}
                    className="text-sm leading-relaxed text-foreground/85"
                  />
                </div>
              </section>

              {data.higherLevels ? (
                <section className="space-y-2">
                  <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Em níveis superiores
                  </h3>
                  <div className="border-l-2 border-secondary/40 pl-3">
                    <PhbProse
                      text={data.higherLevels}
                      className="text-sm leading-relaxed text-foreground/85"
                    />
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
          {actions.map((action) => (
            <Button
              key={action.label}
              type="button"
              variant={action.variant ?? "default"}
              disabled={action.disabled}
              onClick={() => {
                action.onClick();
                onOpenChange(false);
              }}
            >
              {action.label}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 px-2 py-1.5">
      <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
    </div>
  );
}

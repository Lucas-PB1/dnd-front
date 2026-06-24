import type { SpeciesDefinition } from "@/domain/character-sheet/species-details";

type SpeciesHeritagePanelProps = {
  species: SpeciesDefinition;
  speciesName: string;
};

function HeritageItem({
  title,
  children,
}: {
  title: string;
  children: string;
}) {
  return (
    <li>
      <strong className="block text-sm font-semibold text-foreground">
        {title}
      </strong>
      <span className="text-sm text-muted-foreground">{children}</span>
    </li>
  );
}

export function SpeciesHeritagePanel({
  species,
  speciesName,
}: SpeciesHeritagePanelProps) {
  return (
    <aside className="rounded-xl border border-primary/20 bg-muted/30 p-4 lg:max-w-sm">
      <h4 className="mb-3 border-b border-border pb-2 text-xs font-semibold uppercase tracking-widest text-primary">
        Traços de {speciesName}
      </h4>
      <ul className="flex flex-col gap-3">
        {species.traits.map((trait) => (
          <HeritageItem key={trait.title} title={trait.title}>
            {trait.summary}
          </HeritageItem>
        ))}
      </ul>
    </aside>
  );
}

export function SpeciesMetaStrip({ species }: { species: SpeciesDefinition }) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Resumo da espécie">
      <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
        {species.creatureType}
      </span>
      <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
        Desloc. {species.speedLabel}
      </span>
      <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
        {species.sizeLabel}
      </span>
    </div>
  );
}

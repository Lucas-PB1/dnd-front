import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function HeritagesLoading() {
  return (
    <CatalogShell
      title="Heranças"
      description="Identidades de Grim Hollow — Anão, Elfo, Accursed e mais. Lore, build tradicional e pool global de traços modulares."
      backHref="/compendium"
      backLabel="Compêndio"
    >
      <p className="text-sm text-muted-foreground">Carregando heranças…</p>
    </CatalogShell>
  );
}

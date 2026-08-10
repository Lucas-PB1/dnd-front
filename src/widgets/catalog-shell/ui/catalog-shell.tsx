import { AppPageShell } from "@/shared/ui/app-page-shell";
import { CatalogPageHeader } from "@/shared/ui/catalog-page-header";

type CatalogShellProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
};

export function CatalogShell({
  title,
  description,
  backHref,
  backLabel,
  children,
}: CatalogShellProps) {
  return (
    <AppPageShell>
      <CatalogPageHeader
        title={title}
        description={description}
        backHref={backHref}
        backLabel={backLabel}
      />
      {children}
    </AppPageShell>
  );
}

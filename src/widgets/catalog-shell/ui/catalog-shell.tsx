import { CatalogPageHeader } from "@/shared/ui/catalog-page-header";
import { PageMain } from "@/shared/ui/page-main";
import { AppHeader } from "@/widgets/app-header/ui/app-header";

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
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />
      <PageMain>
        <CatalogPageHeader
          title={title}
          description={description}
          backHref={backHref}
          backLabel={backLabel}
        />
        {children}
      </PageMain>
    </div>
  );
}

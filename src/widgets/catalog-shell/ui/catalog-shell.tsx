import { AppHeader } from "@/widgets/app-header/ui/app-header";
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
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <CatalogPageHeader
          title={title}
          description={description}
          backHref={backHref}
          backLabel={backLabel}
        />
        {children}
      </main>
    </div>
  );
}

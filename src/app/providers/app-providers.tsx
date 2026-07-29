import { AuthProvider } from "@/features/auth/model/auth-provider";
import { CatalogSourcesProvider } from "@/features/catalog/catalog-sources/model/catalog-sources-provider";
import { QueryProvider } from "@/app/providers/query-provider";
import { ThemeProvider } from "@/app/providers/theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryProvider>
          <CatalogSourcesProvider>{children}</CatalogSourcesProvider>
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

import { QueryProvider } from "@/presentation/providers/query-provider";
import { ThemeProvider } from "@/presentation/providers/theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}

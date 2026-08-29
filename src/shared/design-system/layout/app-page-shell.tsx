import { cn } from "@/shared/lib/utils";
import { Atmosphere } from "@/shared/design-system/brand/atmosphere";
import {
  PageMain,
  type ContentWidth,
} from "@/shared/design-system/layout/page-main";
import { AppHeader } from "@/widgets/app-header/ui/app-header";

type AppPageShellProps = {
  children: React.ReactNode;
  width?: ContentWidth;
  className?: string;
  mainClassName?: string;
  muteMotion?: boolean;
  /**
   * Camada Atmosphere (grain + gradiente).
   * Desligar só em ferramentas densas sem brand (ex.: encontro).
   */
  atmosphere?: boolean;
};

/** Shell padrão das páginas autenticadas — header + atmosfera + main. */
export function AppPageShell({
  children,
  width = "page",
  className,
  mainClassName,
  muteMotion = false,
  atmosphere = true,
}: AppPageShellProps) {
  return (
    <div
      className={cn(
        "relative flex flex-1 flex-col bg-background text-foreground",
        // Só corta overflow horizontal — fichas longas precisam rolar no eixo Y.
        atmosphere && "overflow-x-hidden",
        className,
      )}
    >
      {atmosphere ? <Atmosphere /> : null}
      <AppHeader className="relative" />
      <PageMain
        width={width}
        muteMotion={muteMotion}
        className={cn("relative", mainClassName)}
      >
        {children}
      </PageMain>
    </div>
  );
}

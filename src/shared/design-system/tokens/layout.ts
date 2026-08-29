/** Larguras compartilhadas dos layouts da aplicação. */
export const contentWidthClass = {
  /** Listagens, hub, wizard, páginas gerais */
  page: "mx-auto w-full max-w-6xl",
  /** Ficha / layouts densos */
  wide: "mx-auto w-full max-w-7xl",
  /** Ficha estilo Beyond (dashboard largo) */
  sheet: "mx-auto w-full max-w-[90rem]",
  /** Hero da home (composição centrada) */
  hero: "mx-auto w-full max-w-3xl",
  /** Formulários de auth */
  auth: "mx-auto w-full max-w-sm",
} as const;

export type ContentWidth = keyof typeof contentWidthClass;

import type { Metadata } from "next";
import { Geist_Mono, Source_Sans_3, Source_Serif_4 } from "next/font/google";

import { AppProviders } from "@/app/providers/app-providers";
import { BRAND_DESCRIPTION, BRAND_NAME } from "@/shared/config/brand";

import "./globals.css";

const fontHeading = Source_Serif_4({
  variable: "--font-heading",
  subsets: ["latin"],
});

const fontSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: BRAND_NAME,
    template: `%s · ${BRAND_NAME}`,
  },
  description: BRAND_DESCRIPTION,
  applicationName: BRAND_NAME,
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${fontHeading.variable} ${fontSans.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

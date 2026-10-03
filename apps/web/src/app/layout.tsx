import * as stylex from "@stylexjs/stylex";
import type { Metadata, Viewport } from "next";
import { LucideProvider } from "lucide-react";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import * as Tooltip from "@/components/ui/tooltip";
import { siteConfig } from "@/site";
import { colors, typography } from "@/styles/shelf/tokens.stylex";
import { MODE_STORAGE_KEY, darkClass, themeScript } from "@/themes/apply";
import { fontVariables } from "@/themes/fonts";
import { ThemeSync } from "@/themes/use-theme";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name}: The design system every product owns`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body suppressHydrationWarning {...stylex.props(styles.body)}>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider
          attribute="class"
          value={{ light: "light", dark: darkClass }}
          storageKey={MODE_STORAGE_KEY}
          defaultTheme="system"
          enableSystem
        >
          <ThemeSync />
          <LucideProvider className={stylex.props(styles.icon).className}>
            <Tooltip.Provider>
              <ToastProvider>{children}</ToastProvider>
            </Tooltip.Provider>
          </LucideProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

const styles = stylex.create({
  body: {
    backgroundColor: colors.background,
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    minHeight: "100dvh",
  },
  icon: {
    flexShrink: 0,
    height: "1em",
    width: "1em",
  },
});

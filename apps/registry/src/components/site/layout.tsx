import * as stylex from "@stylexjs/stylex";
import { Link } from "@tanstack/react-router";
import { type ReactNode, createContext, useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { DarkModeIcon, LightModeIcon } from "@/components/ui/icons";
import { useRegistry } from "@/data";
import { hasFigmaLibrary } from "@/figma";
import { type Theme, applyTheme } from "@/styles/shelf/themes";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { screens, site } from "@/styles/site.stylex";
import { Logo } from "./logo";

const THEME_KEY = "shelf-registry-theme";

export function initialTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function setTheme(theme: Theme): void {
  applyTheme(theme);
  document.documentElement.dataset["mode"] = theme;
}

const ThemeContext = createContext<Theme>("light");

/** The site's theme, so embedded previews can match it. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export function Layout({ children }: { children: ReactNode }) {
  const registry = useRegistry();
  const [theme, setThemeState] = useState<Theme>(() => initialTheme());
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    setThemeState(next);
  };
  const navLink = stylex.props(styles.navLink);
  const navActive = stylex.props(styles.navLink, styles.navActive);

  return (
    <ThemeContext.Provider value={theme}>
      <div {...stylex.props(styles.shell)}>
        <header {...stylex.props(styles.header)}>
          <div {...stylex.props(styles.bar)}>
            <Link
              to="/"
              aria-label="Shelf Registry home"
              {...stylex.props(stylex.defaultMarker(), styles.brand)}
            >
              <Logo />
              <span>Shelf</span>
              <span {...stylex.props(styles.brandMuted)}>Registry</span>
            </Link>
            <nav aria-label="Sections" {...stylex.props(styles.nav)}>
              <Link
                to="/"
                activeOptions={{ exact: true, includeSearch: false }}
                inactiveProps={navLink}
                activeProps={navActive}
              >
                Catalog
              </Link>
              {hasFigmaLibrary(registry) && (
                <>
                  <Link to="/foundations" inactiveProps={navLink} activeProps={navActive}>
                    Foundations
                  </Link>
                  <Link to="/figma" inactiveProps={navLink} activeProps={navActive}>
                    Figma
                  </Link>
                </>
              )}
              {registry.usage && (
                <Link to="/usage" inactiveProps={navLink} activeProps={navActive}>
                  Usage
                </Link>
              )}
            </nav>
            <Button
              variant="ghost"
              size="icon"
              aria-label={theme === "dark" ? "Use light theme" : "Use dark theme"}
              onClick={toggle}
              style={styles.theme}
            >
              {theme === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </Button>
          </div>
        </header>
        <main {...stylex.props(styles.main)}>{children}</main>
        <footer {...stylex.props(styles.footer)}>
          <div {...stylex.props(styles.footerInner)}>
            <span>Built with shelf build</span>
            <span {...stylex.props(styles.footerUrl)}>{registry.url}</span>
          </div>
        </footer>
      </div>
    </ThemeContext.Provider>
  );
}

const styles = stylex.create({
  shell: {
    backgroundColor: colors.background,
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    minHeight: "100vh",
  },
  header: {
    backgroundColor: colors.background,
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  bar: {
    alignItems: "center",
    display: "flex",
    gap: { default: site.space8, [screens.md]: site.space16 },
    height: "5rem",
    marginInline: "auto",
    paddingInline: site.gutter,
  },
  brand: {
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontSize: site.fontSize2xl,
    fontWeight: typography.fontWeightRegular,
    gap: spacing["2"],
    letterSpacing: "-0.03em",
    textDecoration: "none",
  },
  brandMuted: {
    color: colors.mutedForeground,
  },
  nav: {
    alignItems: "center",
    display: "flex",
    gap: { default: spacing["6"], [screens.md]: site.space8 },
  },
  navLink: {
    color: {
      default: colors.mutedForeground,
      [media.hover]: { default: null, ":hover": colors.foreground },
    },
    fontSize: typography.fontSizeLg,
    letterSpacing: "-0.01em",
    textDecoration: "none",
    transitionDuration: motion.durationFast,
    transitionProperty: "color",
  },
  navActive: {
    color: colors.foreground,
  },
  theme: {
    marginInlineStart: "auto",
  },
  main: {
    boxSizing: "border-box",
    flexGrow: 1,
    marginInline: "auto",
    paddingBottom: site.space24,
    paddingInline: site.gutter,
    width: "100%",
  },
  footer: {
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  footerInner: {
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: typography.fontSizeSm,
    gap: spacing["4"],
    justifyContent: "space-between",
    marginInline: "auto",
    paddingBlock: site.space8,
    paddingInline: site.gutter,
  },
  footerUrl: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    overflowWrap: "anywhere",
  },
});

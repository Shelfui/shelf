import * as stylex from "@stylexjs/stylex";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { siteConfig } from "@/site";
import { screens, site } from "@/styles/site.stylex";
import { Customizer } from "./customizer";
import { LinkButton } from "./link-button";
import { Logo } from "./logo";
import { NavLink } from "./nav-link";
import { SearchTrigger } from "./search-trigger";

export function SiteHeader() {
  return (
    <header {...stylex.props(styles.header)}>
      <Link href="/docs" {...stylex.props(styles.announcement)}>
        Shelf is open source and in early preview
        <ArrowRightIcon />
      </Link>
      <div {...stylex.props(styles.inner)}>
        <Link
          href="/"
          aria-label="Shelf home"
          {...stylex.props(stylex.defaultMarker(), styles.brand)}
        >
          <Logo />
          <span>Shelf</span>
        </Link>
        <nav aria-label="Main" {...stylex.props(styles.nav)}>
          <NavLink href="/docs" style={styles.link} activeStyle={styles.active}>
            Docs
          </NavLink>
          <NavLink href="/docs/components" nested style={styles.link} activeStyle={styles.active}>
            Components
          </NavLink>
          <NavLink href="/blocks" nested style={styles.link} activeStyle={styles.active}>
            Blocks
          </NavLink>
          <NavLink href="/registry" style={styles.link} activeStyle={styles.active}>
            Registry
          </NavLink>
        </nav>
        <div {...stylex.props(styles.end)}>
          <SearchTrigger />
          <Customizer />
          <LinkButton
            href={siteConfig.repoUrl}
            variant="ghost"
            size="icon-sm"
            aria-label="Shelf on GitHub"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden>
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
          </LinkButton>
        </div>
      </div>
    </header>
  );
}

const styles = stylex.create({
  header: {
    backgroundColor: colors.background,
    position: "sticky",
    top: 0,
    zIndex: 40,
  },
  announcement: {
    gap: spacing["2"],
    alignItems: "center",
    backgroundColor: colors.card,
    color: colors.foreground,
    display: "flex",
    fontSize: typography.fontSizeSm,
    height: "2.5rem",
    justifyContent: "center",
    textDecoration: {
      default: "none",
      [media.hover]: { default: null, ":hover": "underline" },
    },
  },
  inner: {
    gap: "4rem",
    alignItems: "center",
    display: "flex",
    height: "5rem",
    marginInline: "auto",
    maxWidth: site.pageWidth,
    paddingInline: site.gutter,
  },
  brand: {
    gap: spacing["2"],
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontSize: site.fontSize2xl,
    fontWeight: typography.fontWeightRegular,
    letterSpacing: "-0.03em",
    textDecoration: "none",
  },
  nav: {
    gap: site.space8,
    alignItems: "center",
    display: { default: "none", [screens.md]: "flex" },
  },
  link: {
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
  active: {
    color: colors.foreground,
  },
  end: {
    gap: spacing["3"],
    alignItems: "center",
    display: "flex",
    marginInlineStart: "auto",
  },
});

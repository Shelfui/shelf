import * as stylex from "@stylexjs/stylex";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { screens, site } from "@/styles/site.stylex";
import { Customizer } from "./customizer";
import { GetStarted } from "./get-started";
import { Logo } from "./logo";
import { NavLink } from "./nav-link";

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
          <Customizer />
          <GetStarted style={styles.cta} />
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
  cta: {
    display: { default: "none", [screens.md]: "inline-flex" },
  },
});

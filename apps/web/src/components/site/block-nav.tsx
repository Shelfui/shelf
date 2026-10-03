import * as stylex from "@stylexjs/stylex";
import { blockCategories } from "@/docs/blocks";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { NavLink } from "./nav-link";

export function BlockNav() {
  return (
    <nav aria-label="Block categories" {...stylex.props(styles.nav)}>
      <NavLink href="/blocks" style={styles.link} activeStyle={styles.active}>
        Featured
      </NavLink>
      {blockCategories.map((category) => (
        <NavLink
          key={category.slug}
          href={`/blocks/${category.slug}`}
          style={styles.link}
          activeStyle={styles.active}
        >
          {category.title}
        </NavLink>
      ))}
    </nav>
  );
}

const styles = stylex.create({
  nav: {
    gap: spacing["6"],
    display: "flex",
    overflowX: "auto",
    scrollbarWidth: "none",
  },
  link: {
    color: {
      default: colors.mutedForeground,
      ":hover": { default: null, [media.hover]: colors.foreground },
    },
    flexShrink: 0,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightSm,
    textDecoration: "none",
  },
  active: {
    color: colors.foreground,
  },
});

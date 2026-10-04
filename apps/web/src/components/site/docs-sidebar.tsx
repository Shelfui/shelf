import * as stylex from "@stylexjs/stylex";
import { ScrollArea } from "@/components/ui/scroll-area";
import { components } from "@/docs/components";
import { docGroups } from "@/docs/pages";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { site } from "@/styles/site.stylex";
import { NavLink } from "./nav-link";

export function DocsSidebar() {
  return (
    <aside {...stylex.props(styles.aside)}>
      <ScrollArea style={styles.scroll}>
        <nav aria-label="Docs" {...stylex.props(styles.nav)}>
          {docGroups.map((group) => (
            <Group key={group.title} title={group.title} links={group.links} />
          ))}
          <Group
            title="Components"
            links={components
              .filter((component) => component.group !== "charts")
              .map((component) => ({
                href: `/docs/components/${component.name}`,
                title: component.title,
              }))}
          />
          <Group
            title="Charts"
            links={[
              { href: "/docs/charts", title: "Overview" },
              ...components
                .filter((component) => component.group === "charts")
                .map((component) => ({
                  href: `/docs/components/${component.name}`,
                  title: component.title,
                })),
            ]}
          />
        </nav>
      </ScrollArea>
    </aside>
  );
}

function Group({ title, links }: { title: string; links: { href: string; title: string }[] }) {
  return (
    <div {...stylex.props(styles.group)}>
      <h2 {...stylex.props(styles.groupTitle)}>{title}</h2>
      <ul {...stylex.props(styles.list)}>
        {links.map((link) => (
          <li key={link.href}>
            <NavLink href={link.href} style={styles.link} activeStyle={styles.active}>
              {link.title}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = stylex.create({
  aside: {
    display: { default: "none", "@media (min-width: 768px)": "block" },
    flexShrink: 0,
    height: `calc(100dvh - ${site.headerHeight})`,
    position: "sticky",
    top: site.headerHeight,
    width: "14rem",
  },
  scroll: {
    height: "100%",
    // Content fades out at both edges instead of being cut off.
    maskImage:
      "linear-gradient(to bottom, transparent, #000 1.5rem, #000 calc(100% - 2.5rem), transparent)",
  },
  nav: {
    gap: site.space8,
    display: "grid",
    paddingBottom: site.space16,
    paddingTop: "5rem",
    paddingInlineEnd: spacing["4"],
  },
  group: {
    gap: spacing["2"],
    display: "grid",
  },
  groupTitle: {
    color: colors.foreground,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightSm,
    margin: 0,
    paddingInline: spacing["2"],
  },
  list: {
    gap: 2,
    display: "grid",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  link: {
    backgroundColor: {
      default: "transparent",
      [media.hover]: { default: null, ":hover": colors.muted },
    },
    borderRadius: radius.md,
    color: {
      default: colors.mutedForeground,
      [media.hover]: { default: null, ":hover": colors.foreground },
    },
    display: "block",
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${colors.ring}`,
    },
    paddingBlock: spacing["1.5"],
    paddingInline: spacing["2"],
    textDecoration: "none",
    transitionDuration: motion.durationFast,
    transitionProperty: "background-color, color",
  },
  active: {
    backgroundColor: colors.accent,
    color: colors.foreground,
    fontWeight: typography.fontWeightMedium,
  },
});

import * as stylex from "@stylexjs/stylex";
import { ScrollArea } from "@/components/ui/scroll-area";
import { components } from "@/docs/components";
import { docGroups } from "@/docs/pages";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, spacing, typography } from "@/styles/shelf/tokens.stylex";
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
  },
  nav: {
    gap: site.space10,
    display: "grid",
    paddingBottom: site.space10,
    paddingTop: "5rem",
    paddingInlineEnd: spacing["4"],
  },
  group: {
    gap: spacing["3"],
    display: "grid",
  },
  groupTitle: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightRegular,
    lineHeight: typography.lineHeightSm,
    margin: 0,
  },
  list: {
    borderInlineStartColor: colors.border,
    borderInlineStartStyle: "solid",
    borderInlineStartWidth: 1,
    display: "grid",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  link: {
    borderInlineStartColor: "transparent",
    borderInlineStartStyle: "solid",
    borderInlineStartWidth: 1,
    marginInlineStart: -1,
    paddingInlineStart: spacing["3"],
    color: {
      default: colors.mutedForeground,
      [media.hover]: { default: null, ":hover": colors.foreground },
    },
    display: "block",
    fontSize: typography.fontSizeBase,
    lineHeight: typography.lineHeightBase,
    paddingBlock: spacing["1"],
    textDecoration: "none",
    transitionDuration: motion.durationFast,
    transitionProperty: "color, border-color",
  },
  active: {
    borderInlineStartColor: colors.foreground,
    color: colors.foreground,
  },
});

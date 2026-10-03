import * as stylex from "@stylexjs/stylex";
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { screens, site } from "@/styles/site.stylex";
import { Logo } from "./logo";

const COLUMNS = [
  {
    title: "Shelf",
    links: [
      { href: "/docs", label: "Introduction" },
      { href: "/docs/components", label: "Components" },
      { href: "/blocks", label: "Blocks" },
    ],
  },
  {
    title: "Overlays",
    links: [
      { href: "/docs/components/dialog", label: "Dialog" },
      { href: "/docs/components/drawer", label: "Drawer" },
      { href: "/docs/components/popover", label: "Popover" },
      { href: "/docs/components/tooltip", label: "Tooltip" },
      { href: "/docs/components/toast", label: "Toast" },
    ],
  },
  {
    title: "Forms",
    links: [
      { href: "/docs/components/input", label: "Input" },
      { href: "/docs/components/select", label: "Select" },
      { href: "/docs/components/combobox", label: "Combobox" },
      { href: "/docs/components/checkbox", label: "Checkbox" },
      { href: "/docs/components/form", label: "Form" },
    ],
  },
  {
    title: "Navigation",
    links: [
      { href: "/docs/components/tabs", label: "Tabs" },
      { href: "/docs/components/menubar", label: "Menubar" },
      { href: "/docs/components/breadcrumb", label: "Breadcrumb" },
      { href: "/docs/components/pagination", label: "Pagination" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer {...stylex.props(styles.footer)}>
      <div {...stylex.props(styles.inner)}>
        <div {...stylex.props(styles.about)}>
          <Link
            href="/"
            aria-label="Shelf home"
            {...stylex.props(stylex.defaultMarker(), styles.brand)}
          >
            <Logo />
            <span>Shelf</span>
          </Link>
          <div {...stylex.props(styles.bottom)}>
            <Link href="/docs" {...stylex.props(styles.cta)}>
              Get started
              <ArrowUpRightIcon />
            </Link>
            <p {...stylex.props(styles.legal)}>© {new Date().getFullYear()} Shelf</p>
          </div>
        </div>
        <div {...stylex.props(styles.columns)}>
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title} {...stylex.props(styles.column)}>
              <h2 {...stylex.props(styles.heading)}>{column.title}</h2>
              {column.links.map((link) => (
                <Link key={link.href} href={link.href} {...stylex.props(styles.link)}>
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
      </div>
    </footer>
  );
}

const styles = stylex.create({
  footer: {
    marginInline: "auto",
    maxWidth: site.pageWidth,
    paddingInline: site.gutter,
    width: "100%",
    boxSizing: "border-box",
  },
  inner: {
    gap: site.space16,
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
    display: "grid",
    gridTemplateColumns: { default: "1fr", [screens.md]: "repeat(2, minmax(0, 1fr))" },
    paddingBlock: { default: site.space16, [screens.md]: site.space24 },
  },
  about: {
    gap: site.space16,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  brand: {
    gap: spacing["2"],
    alignItems: "center",
    alignSelf: "flex-start",
    color: colors.foreground,
    display: "flex",
    fontSize: site.fontSize2xl,
    fontWeight: typography.fontWeightMedium,
    letterSpacing: "-0.03em",
    textDecoration: "none",
  },
  bottom: {
    gap: spacing["6"],
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  cta: {
    gap: spacing["2"],
    alignItems: "center",
    borderBottomColor: "currentColor",
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    color: colors.foreground,
    display: "inline-flex",
    fontSize: typography.fontSizeLg,
    paddingBottom: spacing["1"],
    textDecoration: "none",
    opacity: { default: 1, [media.hover]: { default: null, ":hover": 0.7 } },
  },
  legal: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
  },
  columns: {
    columnGap: site.space10,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    rowGap: site.space16,
  },
  column: {
    gap: spacing["3"],
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  heading: {
    margin: 0,
    marginBottom: spacing["2"],
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightRegular,
  },
  link: {
    color: {
      default: colors.foreground,
      [media.hover]: { default: null, ":hover": colors.mutedForeground },
    },
    fontSize: typography.fontSizeLg,
    letterSpacing: "-0.01em",
    textDecoration: "none",
  },
});

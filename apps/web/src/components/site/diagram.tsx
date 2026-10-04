import * as stylex from "@stylexjs/stylex";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { screens, site } from "@/styles/site.stylex";

/**
 * A plain-text drawing. Text between `**` is drawn in the foreground color; the rest is muted.
 * `label` describes the drawing for screen readers, which skip the art itself.
 */
export function Diagram({
  label,
  title,
  children,
  style,
}: {
  label: string;
  title?: string;
  children: string;
  style?: stylex.StaticStyles;
}) {
  const art = children.replace(/^\n/, "").trimEnd();
  return (
    <figure {...stylex.props(styles.figure, style)}>
      {title && <div {...stylex.props(styles.bar)}>{title}</div>}
      <div {...stylex.props(styles.scroll)}>
        <pre aria-hidden {...stylex.props(styles.pre)}>
          {art.split("**").map((part, index) =>
            index % 2 === 1 ? (
              <span key={index} {...stylex.props(styles.strong)}>
                {part}
              </span>
            ) : (
              part
            ),
          )}
        </pre>
      </div>
      <figcaption {...stylex.props(styles.label)}>{label}</figcaption>
    </figure>
  );
}

const styles = stylex.create({
  figure: {
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
    margin: 0,
    minWidth: 0,
  },
  bar: {
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    color: colors.mutedForeground,
    fontFamily: typography.fontFamilyMono,
    fontSize: "0.75rem",
    paddingBlock: spacing["3"],
    paddingInline: { default: spacing["6"], [screens.md]: site.space10 },
  },
  scroll: {
    alignItems: "center",
    display: "flex",
    flexGrow: 1,
    overflowX: "auto",
    padding: { default: spacing["6"], [screens.md]: site.space10 },
  },
  pre: {
    color: colors.mutedForeground,
    // A system monospace: the box-drawing characters would otherwise make the browser fetch
    // an extra Geist Mono file after the stylesheet, just for these diagrams.
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
    fontSize: { default: "0.6875rem", [screens.md]: "0.8125rem" },
    lineHeight: 1.45,
    margin: 0,
    marginInline: "auto",
    whiteSpace: "pre",
    width: "max-content",
  },
  strong: {
    color: colors.foreground,
  },
  label: {
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    whiteSpace: "nowrap",
    width: 1,
  },
});

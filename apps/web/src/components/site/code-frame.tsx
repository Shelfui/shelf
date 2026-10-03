import * as stylex from "@stylexjs/stylex";
import { ScrollArea } from "@/components/ui/scroll-area";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { CopyButton } from "./copy-button";

export interface CodeFrameProps {
  /** The source, for copying and for the unhighlighted fallback. */
  code: string;
  /** Highlighted markup from `highlight()`. */
  html?: string | undefined;
  /** A file name or label shown above the code. */
  title?: string | undefined;
  /** Caps the height so long files scroll inside the frame. */
  maxHeight?: boolean | undefined;
}

export function CodeFrame({ code, html, title, maxHeight = false }: CodeFrameProps) {
  return (
    <div {...stylex.props(styles.root)}>
      {title && (
        <div {...stylex.props(styles.header)}>
          <span {...stylex.props(styles.title)}>{title}</span>
          <CopyButton value={code} />
        </div>
      )}
      <ScrollArea style={[styles.scroll, maxHeight && styles.capped]}>
        {html ? (
          <div {...stylex.props(styles.code)} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div {...stylex.props(styles.code)}>
            <pre {...stylex.props(styles.plain)}>
              <code>{code}</code>
            </pre>
          </div>
        )}
      </ScrollArea>
      {!title && <CopyButton value={code} style={styles.copy} />}
    </div>
  );
}

const styles = stylex.create({
  root: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    minWidth: 0,
    overflow: "hidden",
    position: "relative",
  },
  header: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    display: "flex",
    justifyContent: "space-between",
    paddingBlock: spacing["1"],
    paddingInlineEnd: spacing["1"],
    paddingInlineStart: spacing["6"],
  },
  title: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
  },
  scroll: {
    borderRadius: radius.lg,
  },
  capped: {
    maxHeight: "32rem",
  },
  code: {
    color: colors.foreground,
    fontFamily: typography.fontFamilyMono,
    fontSize: "0.8125rem",
    lineHeight: "1.4rem",
    paddingBlock: spacing["6"],
    paddingInlineEnd: "3.5rem",
    paddingInlineStart: spacing["6"],
    tabSize: 2,
    width: "max-content",
  },
  plain: {
    font: "inherit",
    margin: 0,
  },
  copy: {
    insetInlineEnd: spacing["2"],
    position: "absolute",
    top: spacing["2"],
  },
});

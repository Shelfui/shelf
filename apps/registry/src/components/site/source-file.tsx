import * as stylex from "@stylexjs/stylex";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchText, useAsync } from "@/data";
import { highlight, languageOf } from "@/lib/highlight";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";

/** One registry file, fetched from the registry and highlighted. */
export function SourceFile({ path, name }: { path: string; name: string }) {
  const { value, error } = useAsync(
    () => fetchText(path).then((code) => highlight(code, languageOf(name))),
    path,
  );
  return (
    <figure {...stylex.props(styles.figure)}>
      <figcaption {...stylex.props(styles.caption)}>{name}</figcaption>
      {error ? (
        <p {...stylex.props(styles.error)}>{error.message}</p>
      ) : value === undefined ? (
        <div {...stylex.props(styles.loading)}>
          <Skeleton style={styles.line} />
          <Skeleton style={styles.line} />
          <Skeleton style={styles.line} />
        </div>
      ) : (
        // Shiki escapes the source; the HTML is its token markup.
        <div {...stylex.props(styles.code)} dangerouslySetInnerHTML={{ __html: value }} />
      )}
    </figure>
  );
}

const styles = stylex.create({
  figure: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    margin: 0,
    overflow: "hidden",
  },
  caption: {
    backgroundColor: colors.muted,
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    color: colors.mutedForeground,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    paddingBlock: spacing["2"],
    paddingInline: spacing["4"],
  },
  code: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeightXs,
    maxHeight: "32rem",
    overflow: "auto",
    padding: spacing["4"],
  },
  loading: {
    display: "grid",
    gap: spacing["2"],
    padding: spacing["4"],
  },
  line: {
    height: spacing["3"],
  },
  error: {
    color: colors.destructiveText,
    fontSize: typography.fontSizeSm,
    padding: spacing["4"],
  },
});

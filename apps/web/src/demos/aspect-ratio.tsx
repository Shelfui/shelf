import * as stylex from "@stylexjs/stylex";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";

export default function AspectRatioDemo() {
  return (
    <figure {...stylex.props(styles.figure)}>
      <AspectRatio ratio={16 / 9} style={styles.frame}>
        <div {...stylex.props(styles.art)} />
      </AspectRatio>
      <figcaption {...stylex.props(styles.caption)}>16:9 at any width.</figcaption>
    </figure>
  );
}

const styles = stylex.create({
  figure: { margin: 0, gap: spacing["2"], display: "grid", maxWidth: "24rem", width: "100%" },
  frame: { borderRadius: radius.lg, backgroundColor: colors.muted },
  art: {
    backgroundImage: `linear-gradient(135deg, ${colors.muted}, ${colors.mutedForeground})`,
  },
  caption: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
});

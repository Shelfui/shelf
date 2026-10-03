import * as stylex from "@stylexjs/stylex";
import { Separator } from "@/components/ui/separator";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";

export default function SeparatorDemo() {
  return (
    <div {...stylex.props(styles.root)}>
      <div>
        <h4 {...stylex.props(styles.title)}>Shelf</h4>
        <p {...stylex.props(styles.muted)}>Components you copy in and own.</p>
      </div>
      <Separator />
      <div {...stylex.props(styles.row)}>
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Components</span>
        <Separator orientation="vertical" />
        <span>Source</span>
      </div>
    </div>
  );
}

const styles = stylex.create({
  root: { gap: spacing["4"], display: "grid", fontSize: typography.fontSizeSm, width: "18rem" },
  title: { fontWeight: typography.fontWeightMedium, margin: 0 },
  muted: { color: colors.mutedForeground, margin: 0 },
  row: { gap: spacing["4"], alignItems: "center", display: "flex", height: "1.25rem" },
});

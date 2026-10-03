import * as stylex from "@stylexjs/stylex";
import { Skeleton } from "@/components/ui/skeleton";
import { radius, spacing } from "@/styles/shelf/tokens.stylex";

export default function SkeletonDemo() {
  return (
    <div {...stylex.props(styles.row)}>
      <Skeleton style={styles.avatar} />
      <div {...stylex.props(styles.lines)}>
        <Skeleton style={styles.line} />
        <Skeleton style={styles.short} />
      </div>
    </div>
  );
}

const styles = stylex.create({
  row: { gap: spacing["4"], alignItems: "center", display: "flex" },
  avatar: { borderRadius: radius.full, height: "3rem", width: "3rem" },
  lines: { gap: spacing["2"], display: "grid" },
  line: { height: "1rem", width: "15rem" },
  short: { height: "1rem", width: "10rem" },
});

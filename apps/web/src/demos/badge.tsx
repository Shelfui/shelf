import * as stylex from "@stylexjs/stylex";
import { Badge } from "@/components/ui/badge";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function BadgeDemo() {
  return (
    <div {...stylex.props(styles.row)}>
      <Badge>Paid</Badge>
      <Badge variant="secondary">Draft</Badge>
      <Badge variant="outline">Scheduled</Badge>
      <Badge variant="destructive">Overdue</Badge>
    </div>
  );
}

const styles = stylex.create({
  row: { gap: spacing["2"], display: "flex", flexWrap: "wrap" },
});

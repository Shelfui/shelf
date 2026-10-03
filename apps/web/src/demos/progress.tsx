import * as stylex from "@stylexjs/stylex";
import { Progress } from "@/components/ui/progress";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function ProgressDemo() {
  return (
    <div {...stylex.props(styles.stack)}>
      <Progress label="Uploading receipts" value={40} showValue />
      <Progress aria-label="Loading invoices" value={null} />
    </div>
  );
}

const styles = stylex.create({
  stack: { gap: spacing["6"], display: "grid", maxWidth: "20rem", width: "100%" },
});

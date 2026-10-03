import * as stylex from "@stylexjs/stylex";
import { Meter } from "@/components/ui/meter";

export default function MeterDemo() {
  return (
    <div {...stylex.props(styles.root)}>
      <Meter label="Storage used" value={72} showValue />
    </div>
  );
}

const styles = stylex.create({
  root: { maxWidth: "20rem", width: "100%" },
});

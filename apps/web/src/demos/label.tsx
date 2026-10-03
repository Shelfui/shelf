import * as stylex from "@stylexjs/stylex";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function LabelDemo() {
  return (
    <div {...stylex.props(styles.stack)}>
      <Label htmlFor="label-company">Company name</Label>
      <Input id="label-company" placeholder="Acme Inc." />
    </div>
  );
}

const styles = stylex.create({
  stack: { gap: spacing["2"], display: "grid", maxWidth: "20rem", width: "100%" },
});

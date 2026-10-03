import * as stylex from "@stylexjs/stylex";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function CheckboxDemo() {
  return (
    <div {...stylex.props(styles.stack)}>
      <Label>
        <Checkbox defaultChecked /> Accept the terms of service
      </Label>
      <Label>
        <Checkbox /> Email me about product updates
      </Label>
      <Label>
        <Checkbox disabled /> Share usage data (managed by your admin)
      </Label>
    </div>
  );
}

const styles = stylex.create({
  stack: { gap: spacing["3"], display: "grid" },
});

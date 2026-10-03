import * as stylex from "@stylexjs/stylex";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function SwitchDemo() {
  return (
    <div {...stylex.props(styles.stack)}>
      <Label>
        <Switch defaultChecked /> Airplane mode
      </Label>
      <Label>
        <Switch /> Email notifications
      </Label>
    </div>
  );
}

const styles = stylex.create({
  stack: { gap: spacing["3"], display: "grid" },
});

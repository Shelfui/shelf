import * as stylex from "@stylexjs/stylex";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { spacing, typography } from "@/styles/shelf/tokens.stylex";

export default function RadioGroupDemo() {
  return (
    <div {...stylex.props(styles.stack)}>
      <span id="billing-label" {...stylex.props(styles.legend)}>
        Billing period
      </span>
      <RadioGroup aria-labelledby="billing-label" defaultValue="monthly" style={styles.stack}>
        <Label>
          <RadioGroupItem value="monthly" /> Monthly
        </Label>
        <Label>
          <RadioGroupItem value="yearly" /> Yearly (2 months free)
        </Label>
        <Label>
          <RadioGroupItem value="lifetime" disabled /> Lifetime
        </Label>
      </RadioGroup>
    </div>
  );
}

const styles = stylex.create({
  stack: { gap: spacing["3"], display: "grid" },
  legend: { fontSize: typography.fontSizeSm, fontWeight: typography.fontWeightMedium },
});

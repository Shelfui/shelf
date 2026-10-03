import * as stylex from "@stylexjs/stylex";
import * as Field from "@/components/ui/field";
import * as Select from "@/components/ui/select";

const PLANS = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

export default function SelectDemo() {
  return (
    <Field.Root style={styles.root}>
      <Field.Label>Plan</Field.Label>
      <Select.Root items={PLANS}>
        <Select.Trigger>
          <Select.Value placeholder="Choose a plan" />
        </Select.Trigger>
        <Select.Content>
          {PLANS.map((plan) => (
            <Select.Item key={plan.value} value={plan.value}>
              {plan.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Field.Root>
  );
}

const styles = stylex.create({
  root: { width: "14rem" },
});

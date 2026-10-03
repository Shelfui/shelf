import * as stylex from "@stylexjs/stylex";
import * as Field from "@/components/ui/field";
import * as Fieldset from "@/components/ui/fieldset";
import { Input } from "@/components/ui/input";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function FieldsetDemo() {
  return (
    <Fieldset.Root style={styles.root}>
      <Fieldset.Legend>Billing details</Fieldset.Legend>
      <Field.Root>
        <Field.Label>Company</Field.Label>
        <Input defaultValue="Acme Inc." />
      </Field.Root>
      <div {...stylex.props(styles.row)}>
        <Field.Root>
          <Field.Label>City</Field.Label>
          <Input defaultValue="Stockholm" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Postal code</Field.Label>
          <Input defaultValue="111 22" />
        </Field.Root>
      </div>
    </Fieldset.Root>
  );
}

const styles = stylex.create({
  root: { maxWidth: "24rem", width: "100%" },
  row: { gap: spacing["4"], display: "grid", gridTemplateColumns: "1fr 1fr" },
});

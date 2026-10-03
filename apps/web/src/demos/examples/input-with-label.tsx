import * as stylex from "@stylexjs/stylex";
import * as Field from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function InputWithLabel() {
  return (
    <Field.Root style={styles.root}>
      <Field.Label>Email</Field.Label>
      <Input type="email" placeholder="ada@example.com" />
      <Field.Description>We send invoices and receipts here.</Field.Description>
    </Field.Root>
  );
}

const styles = stylex.create({
  root: { maxWidth: "20rem", width: "100%" },
});

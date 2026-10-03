import * as stylex from "@stylexjs/stylex";
import * as Field from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function FieldDemo() {
  return (
    <Field.Root name="email" style={styles.root}>
      <Field.Label>Email</Field.Label>
      <Input type="email" required placeholder="ada@example.com" />
      <Field.Description>We only use it to send receipts.</Field.Description>
      <Field.Error match="valueMissing">Enter your email.</Field.Error>
      <Field.Error match="typeMismatch">Enter a valid email address.</Field.Error>
    </Field.Root>
  );
}

const styles = stylex.create({
  root: { maxWidth: "20rem", width: "100%" },
});

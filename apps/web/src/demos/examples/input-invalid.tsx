import * as stylex from "@stylexjs/stylex";
import * as Field from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function InputInvalid() {
  return (
    <Field.Root invalid style={styles.root}>
      <Field.Label>Email</Field.Label>
      <Input type="email" defaultValue="ada@example" />
      <Field.Error match>Enter a full email address, like ada@example.com.</Field.Error>
    </Field.Root>
  );
}

const styles = stylex.create({
  root: { maxWidth: "20rem", width: "100%" },
});

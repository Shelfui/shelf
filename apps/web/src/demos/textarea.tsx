import * as stylex from "@stylexjs/stylex";
import * as Field from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export default function TextareaDemo() {
  return (
    <Field.Root style={styles.root}>
      <Field.Label>Message</Field.Label>
      <Textarea placeholder="Tell us what you're working on" />
      <Field.Description>It grows as you type.</Field.Description>
    </Field.Root>
  );
}

const styles = stylex.create({
  root: { maxWidth: "24rem", width: "100%" },
});

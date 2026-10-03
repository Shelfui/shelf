import * as stylex from "@stylexjs/stylex";
import * as Field from "@/components/ui/field";
import * as NumberField from "@/components/ui/number-field";

export default function NumberFieldDemo() {
  return (
    <Field.Root style={styles.root}>
      <Field.Label>Seats</Field.Label>
      <NumberField.Root defaultValue={5} min={1} max={50}>
        <NumberField.Group>
          <NumberField.Decrement />
          <NumberField.Input />
          <NumberField.Increment />
        </NumberField.Group>
      </NumberField.Root>
    </Field.Root>
  );
}

const styles = stylex.create({
  root: { width: "10rem" },
});

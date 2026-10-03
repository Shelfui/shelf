import * as stylex from "@stylexjs/stylex";
import { Input } from "@/components/ui/input";

export default function InputDemo() {
  return (
    <Input aria-label="Email" type="email" placeholder="ada@example.com" style={styles.input} />
  );
}

const styles = stylex.create({
  input: { maxWidth: "20rem" },
});

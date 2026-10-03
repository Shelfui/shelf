import * as stylex from "@stylexjs/stylex";
import { Input } from "@/components/ui/input";

export default function InputDisabled() {
  return <Input aria-label="Workspace ID" defaultValue="ws_8f2k4" disabled style={styles.input} />;
}

const styles = stylex.create({
  input: { maxWidth: "20rem" },
});

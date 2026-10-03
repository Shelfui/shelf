import * as stylex from "@stylexjs/stylex";
import { Slider } from "@/components/ui/slider";

export default function SliderDisabled() {
  return <Slider aria-label="Volume" defaultValue={30} disabled style={styles.slider} />;
}

const styles = stylex.create({
  slider: { maxWidth: "20rem", width: "100%" },
});

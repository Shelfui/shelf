import * as stylex from "@stylexjs/stylex";
import { Slider } from "@/components/ui/slider";

export default function SliderDemo() {
  return <Slider aria-label="Volume" defaultValue={50} style={styles.slider} />;
}

const styles = stylex.create({
  slider: { maxWidth: "20rem", width: "100%" },
});

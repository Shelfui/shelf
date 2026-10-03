"use client";

import * as stylex from "@stylexjs/stylex";
import { Slider } from "@/components/ui/slider";

export default function SliderRange() {
  return (
    <Slider
      defaultValue={[20, 80]}
      getAriaLabel={(index) => (index === 0 ? "Minimum price" : "Maximum price")}
      style={styles.slider}
    />
  );
}

const styles = stylex.create({
  slider: { maxWidth: "20rem", width: "100%" },
});

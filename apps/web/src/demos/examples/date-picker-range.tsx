"use client";

import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { DateRangePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function DatePickerRange() {
  const id = useId();

  return (
    <div {...stylex.props(styles.field)}>
      <Label htmlFor={id}>Trip dates</Label>
      <DateRangePicker id={id} placeholder="Pick your dates" />
    </div>
  );
}

const styles = stylex.create({
  field: { gap: spacing["2"], display: "grid" },
});

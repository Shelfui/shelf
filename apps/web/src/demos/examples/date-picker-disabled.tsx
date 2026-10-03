"use client";

import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function DatePickerDisabled() {
  const id = useId();

  return (
    <div {...stylex.props(styles.field)}>
      <Label htmlFor={id}>Start date</Label>
      <DatePicker id={id} disabled />
    </div>
  );
}

const styles = stylex.create({
  field: { gap: spacing["2"], display: "grid" },
});

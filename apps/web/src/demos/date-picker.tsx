"use client";

import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function DatePickerDemo() {
  const id = useId();

  return (
    <div {...stylex.props(styles.field)}>
      <Label htmlFor={id}>Due date</Label>
      <DatePicker id={id} />
    </div>
  );
}

const styles = stylex.create({
  field: { gap: spacing["2"], display: "grid" },
});

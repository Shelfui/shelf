"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { colors, radius } from "@/styles/shelf/tokens.stylex";

export default function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(() => new Date());

  return <Calendar mode="single" selected={date} onSelect={setDate} style={styles.card} />;
}

const styles = stylex.create({
  card: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
  },
});

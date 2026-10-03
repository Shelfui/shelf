"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { colors, radius } from "@/styles/shelf/tokens.stylex";

export default function CalendarDisabledDays() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      disabled={[{ dayOfWeek: [0, 6] }, { before: new Date() }]}
      style={styles.card}
    />
  );
}

const styles = stylex.create({
  card: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
  },
});

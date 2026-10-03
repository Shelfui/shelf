"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { colors, radius } from "@/styles/shelf/tokens.stylex";

export default function CalendarDropdowns() {
  const [date, setDate] = useState<Date | undefined>(() => new Date(1990, 5, 12));
  const [today] = useState(() => new Date());

  return (
    <Calendar
      mode="single"
      captionLayout="dropdown"
      defaultMonth={date}
      selected={date}
      onSelect={setDate}
      startMonth={new Date(1930, 0)}
      endMonth={today}
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

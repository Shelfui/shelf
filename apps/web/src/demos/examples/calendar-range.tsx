"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { colors, radius } from "@/styles/shelf/tokens.stylex";

const daysFromToday = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export default function CalendarRange() {
  const [range, setRange] = useState<DateRange | undefined>(() => ({
    from: daysFromToday(3),
    to: daysFromToday(9),
  }));

  return (
    <Calendar
      mode="range"
      numberOfMonths={2}
      defaultMonth={range?.from}
      selected={range}
      onSelect={setRange}
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

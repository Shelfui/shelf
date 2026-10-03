"use client";

import * as stylex from "@stylexjs/stylex";
import { type ReactNode, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import { colors, typography } from "@/styles/shelf/tokens.stylex";
import { Button, type ButtonProps } from "./button";
import { Calendar } from "./calendar";
import { CalendarIcon } from "./icons";
import * as Popover from "./popover";

type TriggerProps = Omit<
  ButtonProps,
  "value" | "defaultValue" | "onChange" | "children" | "variant" | "size"
>;

type PickerProps<Value> = TriggerProps & {
  /** The picked value, or `null` for none. Pass with `onValueChange` to control it. */
  value?: Value | null;
  defaultValue?: Value | null;
  onValueChange?: (value: Value | null) => void;
  /** Shown in the trigger until a date is picked. */
  placeholder?: string;
  /** Formats a date for the trigger. Defaults to the user's locale, medium length. */
  formatDate?: (date: Date) => string;
};

export type DatePickerProps = PickerProps<Date>;
export type DateRangePickerProps = PickerProps<DateRange>;

/**
 * A button that opens a Calendar in a Popover to pick one date:
 *
 *   <DatePicker value={date} onValueChange={setDate} />
 *
 * Picking a date closes the popover and returns focus to the trigger. Name it
 * with a `Label` pointing at its `id`, or `aria-label`.
 */
export function DatePicker({
  value,
  defaultValue = null,
  onValueChange,
  placeholder = "Pick a date",
  formatDate = formatMediumDate,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useValue(value, defaultValue, onValueChange);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Trigger {...props} placeholder={placeholder}>
        {date && formatDate(date)}
      </Trigger>
      <Popover.Content aria-label="Choose a date" {...contentProps}>
        <Calendar
          mode="single"
          required
          autoFocus
          defaultMonth={date ?? undefined}
          selected={date ?? undefined}
          onSelect={(next) => {
            setDate(next);
            setOpen(false);
          }}
          style={styles.calendar}
        />
      </Popover.Content>
    </Popover.Root>
  );
}

/**
 * A button that opens a two-month Calendar to pick a date range. The first
 * click starts a new range and the second ends it and closes the popover.
 */
export function DateRangePicker({
  value,
  defaultValue = null,
  onValueChange,
  placeholder = "Pick a date range",
  formatDate = formatMediumDate,
  ...props
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useValue(value, defaultValue, onValueChange);
  const picking = useRef(false);

  const onOpenChange = (next: boolean) => {
    picking.current = false;
    setOpen(next);
  };

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Trigger {...props} placeholder={placeholder}>
        {range?.from &&
          (range.to
            ? `${formatDate(range.from)} – ${formatDate(range.to)}`
            : formatDate(range.from))}
      </Trigger>
      <Popover.Content aria-label="Choose a date range" {...contentProps}>
        <Calendar
          mode="range"
          required
          autoFocus
          numberOfMonths={2}
          defaultMonth={range?.from}
          selected={range ?? undefined}
          onSelect={(next, day) => {
            if (!picking.current) {
              picking.current = true;
              setRange({ from: day, to: undefined });
              return;
            }
            setRange(next);
            onOpenChange(false);
          }}
          style={styles.calendar}
        />
      </Popover.Content>
    </Popover.Root>
  );
}

function Trigger({
  placeholder,
  disabled,
  style,
  children,
  ...props
}: TriggerProps & { placeholder: string; children: ReactNode }) {
  return (
    <Popover.Trigger
      disabled={disabled}
      render={
        <Button
          data-slot="date-picker-trigger"
          variant="outline"
          {...props}
          disabled={disabled}
          style={[styles.trigger, style]}
        />
      }
    >
      <CalendarIcon {...stylex.props(styles.icon)} />
      <span {...stylex.props(styles.value, !children && styles.placeholder)}>
        {children || placeholder}
      </span>
    </Popover.Trigger>
  );
}

function useValue<Value>(
  value: Value | null | undefined,
  defaultValue: Value | null,
  onValueChange: ((value: Value | null) => void) | undefined,
) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = value === undefined ? uncontrolled : value;

  const setValue = (next: Value | null) => {
    if (value === undefined) setUncontrolled(next);
    onValueChange?.(next);
  };

  return [current, setValue] as const;
}

const mediumDate = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

function formatMediumDate(date: Date) {
  return mediumDate.format(date);
}

const styles = stylex.create({
  trigger: {
    fontWeight: typography.fontWeightRegular,
    justifyContent: "flex-start",
    width: "15rem",
  },
  icon: {
    color: colors.mutedForeground,
  },
  value: {
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  placeholder: {
    color: colors.mutedForeground,
  },
  content: {
    padding: 0,
    width: "auto",
  },
  calendar: {
    backgroundColor: "transparent",
  },
});

const contentProps = {
  align: "start",
  // The calendar focuses the picked day, or today, when it opens.
  initialFocus: false,
  style: styles.content,
} as const;

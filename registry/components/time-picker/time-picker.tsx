"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, useState } from "react";
import { colors, spacing, typography } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";
import * as NumberField from "../number-field/number-field";
import * as Select from "../select/select";

export interface TimePickerProps extends Styled<
  Omit<ComponentProps<"div">, "defaultValue" | "onChange" | "role">
> {
  /** A 24-hour time such as "14:30". */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Show 1 to 12 with an AM/PM list. The value stays 24-hour. */
  hour12?: boolean;
  /** Minutes change by this much with the arrow keys. */
  minuteStep?: number;
  disabled?: boolean;
  /** Names the group, such as "Start time". */
  "aria-label": string;
}

const PERIODS = [
  { value: "am", label: "AM" },
  { value: "pm", label: "PM" },
];

function parse(time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return { hours: hours % 24, minutes: minutes % 60 };
}

function format(hours: number, minutes: number) {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Hours and minutes as number fields, with an AM/PM list in 12-hour mode. It pairs with
 * DatePicker: keep the date and the time as separate values and join them where you submit.
 *
 *   <TimePicker aria-label="Start time" defaultValue="09:30" onValueChange={setTime} />
 */
export function TimePicker({
  value,
  defaultValue = "00:00",
  onValueChange,
  hour12 = false,
  minuteStep = 1,
  disabled,
  style,
  ...props
}: TimePickerProps) {
  const [inner, setInner] = useState(defaultValue);
  const { hours, minutes } = parse(value ?? inner);
  const pm = hours >= 12;

  const change = (nextHours: number, nextMinutes: number) => {
    const next = format(nextHours, nextMinutes);
    setInner(next);
    onValueChange?.(next);
  };

  const shownHours = hour12 ? hours % 12 || 12 : hours;
  const two = { minimumIntegerDigits: 2 };

  return (
    <div data-slot="time-picker" role="group" {...props} {...stylex.props(styles.root, style)}>
      <NumberField.Root
        value={shownHours}
        min={hour12 ? 1 : 0}
        max={hour12 ? 12 : 23}
        format={two}
        disabled={disabled}
        onValueChange={(next) => {
          if (next === null) return;
          change(hour12 ? (next % 12) + (pm ? 12 : 0) : next, minutes);
        }}
        style={styles.field}
      >
        <NumberField.Group>
          <NumberField.Input aria-label="Hours" />
        </NumberField.Group>
      </NumberField.Root>
      <span aria-hidden {...stylex.props(styles.colon)}>
        :
      </span>
      <NumberField.Root
        value={minutes}
        min={0}
        max={59}
        step={minuteStep}
        format={two}
        disabled={disabled}
        onValueChange={(next) => {
          if (next !== null) change(hours, next);
        }}
        style={styles.field}
      >
        <NumberField.Group>
          <NumberField.Input aria-label="Minutes" />
        </NumberField.Group>
      </NumberField.Root>
      {hour12 ? (
        <Select.Root
          items={PERIODS}
          value={pm ? "pm" : "am"}
          disabled={disabled}
          onValueChange={(next) => change((hours % 12) + (next === "pm" ? 12 : 0), minutes)}
        >
          <Select.Trigger aria-label="AM or PM" style={styles.period}>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {PERIODS.map((period) => (
              <Select.Item key={period.value} value={period.value}>
                {period.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      ) : null}
    </div>
  );
}

const styles = stylex.create({
  root: {
    gap: spacing["1.5"],
    alignItems: "center",
    display: "inline-flex",
  },
  field: {
    width: "3.5rem",
  },
  colon: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily,
  },
  period: {
    width: "5rem",
  },
});

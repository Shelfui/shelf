"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef } from "react";
import {
  type ChevronProps,
  type ClassNames,
  type CustomComponents,
  type DayButtonProps,
  DayPicker,
  type DayPickerProps,
  type DayProps,
  type PreviousMonthButtonProps,
  type RootProps,
} from "react-day-picker";
import { colors, radius, sizes, spacing, typography } from "../../foundations/tokens.stylex";
import { Button, buttonStyles } from "../button/button";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "../icons/icons";
import { type Styled, isAriaTrue } from "../../lib/utils";

type StyleProps =
  | "classNames"
  | "styles"
  | "modifiersClassNames"
  | "modifiersStyles"
  | "components";

export type CalendarProps = DayPickerProps extends infer Props
  ? Props extends unknown
    ? Styled<Omit<Props, StyleProps>>
    : never
  : never;

/**
 * A month grid for picking dates, built on react-day-picker. Pass `mode` for
 * `single`, `range`, or `multiple` selection:
 *
 *   <Calendar mode="single" selected={date} onSelect={setDate} />
 *
 * Arrow keys move between days, Page Up/Down between months. Set
 * `captionLayout="dropdown"` for month and year menus, and `numberOfMonths` to
 * show several months side by side.
 */
export function Calendar({
  captionLayout = "label",
  showOutsideDays = true,
  style,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      captionLayout={captionLayout}
      showOutsideDays={showOutsideDays}
      {...props}
      className={stylex.props(styles.root, style).className}
      classNames={captionLayout === "label" ? classNames : dropdownClassNames}
      components={components}
    />
  );
}

function Root({ rootRef, ...props }: RootProps) {
  return <div data-slot="calendar" ref={rootRef} {...props} />;
}

function Chevron({ orientation }: ChevronProps) {
  if (orientation === "left") return <ChevronLeftIcon />;
  if (orientation === "right") return <ChevronRightIcon />;
  if (orientation === "up") return <ChevronUpIcon />;
  return <ChevronDownIcon />;
}

function NavButton({ className: _className, style: _style, ...props }: PreviousMonthButtonProps) {
  const disabled = isAriaTrue(props["aria-disabled"]);
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      {...props}
      disabled={disabled}
      style={!disabled && styles.navButton}
    />
  );
}

function Day({ day: _day, modifiers, className: _className, style: _style, ...props }: DayProps) {
  return (
    <td
      data-slot="calendar-day"
      {...props}
      {...stylex.props(
        styles.day,
        modifiers.range_middle && styles.rangeMiddle,
        modifiers.range_start && styles.rangeStart,
        modifiers.range_end && styles.rangeEnd,
      )}
    />
  );
}

function DayButton({
  day: _day,
  modifiers,
  className: _className,
  style: _style,
  ...props
}: DayButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  // DayPicker moves focus by marking a day `focused`; the button follows.
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <button
      ref={ref}
      {...props}
      {...stylex.props(
        buttonStyles("ghost", "icon"),
        styles.dayButton,
        modifiers.outside && styles.outside,
        modifiers.today && !modifiers.outside && styles.today,
        modifiers.selected && styles.selected,
        modifiers.range_middle && styles.rangeMiddleButton,
        modifiers.disabled && styles.disabled,
      )}
    />
  );
}

const styles = stylex.create({
  root: {
    fontSynthesis: "none",
    padding: spacing["3"],
    backgroundColor: colors.background,
    boxSizing: "border-box",
    color: colors.foreground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    width: "fit-content",
  },
  months: {
    gap: spacing["4"],
    display: "flex",
    flexWrap: "wrap",
    position: "relative",
  },
  month: {
    gap: spacing["4"],
    display: "flex",
    flexDirection: "column",
  },
  nav: {
    gap: spacing["1"],
    insetInline: 0,
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    pointerEvents: "none",
    position: "absolute",
    height: sizes.controlDefault,
    top: 0,
  },
  navButton: {
    pointerEvents: "auto",
  },
  caption: {
    paddingInline: sizes.controlDefault,
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    height: sizes.controlDefault,
  },
  captionLabel: {
    fontWeight: typography.fontWeightMedium,
    userSelect: "none",
  },
  dropdowns: {
    gap: spacing["1.5"],
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
  },
  dropdownRoot: {
    borderColor: {
      default: colors.input,
      ":focus-within": colors.ring,
    },
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    boxShadow: {
      default: null,
      ":focus-within": `0 0 0 3px color-mix(in oklab, ${colors.ring} 50%, transparent)`,
    },
    position: "relative",
  },
  dropdown: {
    inset: 0,
    margin: 0,
    cursor: "pointer",
    opacity: 0,
    position: "absolute",
    width: "100%",
  },
  dropdownLabel: {
    gap: spacing["1"],
    paddingInline: spacing["2"],
    alignItems: "center",
    display: "flex",
    height: sizes.controlSm,
  },
  grid: {
    marginBlock: `calc(-1 * ${spacing["1"]})`,
    borderCollapse: "separate",
    borderSpacing: `0 ${spacing["1"]}`,
  },
  weekday: {
    padding: 0,
    color: colors.mutedForeground,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightRegular,
    lineHeight: typography.lineHeightXs,
    textAlign: "center",
    width: sizes.controlDefault,
  },
  weekNumber: {
    padding: 0,
    color: colors.mutedForeground,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightRegular,
    textAlign: "center",
    width: sizes.controlDefault,
  },
  day: {
    padding: 0,
    textAlign: "center",
    height: sizes.controlDefault,
    width: sizes.controlDefault,
  },
  rangeMiddle: {
    backgroundColor: colors.accent,
  },
  rangeStart: {
    backgroundColor: colors.accent,
    borderEndStartRadius: radius.md,
    borderStartStartRadius: radius.md,
  },
  rangeEnd: {
    backgroundColor: colors.accent,
    borderEndEndRadius: radius.md,
    borderStartEndRadius: radius.md,
  },
  dayButton: {
    fontSize: typography.fontSizeSm,
    fontVariantNumeric: "tabular-nums",
    fontWeight: typography.fontWeightRegular,
    position: "relative",
  },
  outside: {
    color: colors.mutedForeground,
  },
  today: {
    backgroundColor: colors.accent,
    color: colors.accentForeground,
  },
  selected: {
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
  },
  rangeMiddleButton: {
    borderRadius: 0,
    backgroundColor: "transparent",
    color: colors.accentForeground,
  },
  disabled: {
    cursor: "default",
    opacity: 0.5,
  },
});

const classNames: Partial<ClassNames> = {
  months: stylex.props(styles.months).className,
  month: stylex.props(styles.month).className,
  nav: stylex.props(styles.nav).className,
  month_caption: stylex.props(styles.caption).className,
  caption_label: stylex.props(styles.captionLabel).className,
  dropdowns: stylex.props(styles.dropdowns).className,
  dropdown_root: stylex.props(styles.dropdownRoot).className,
  dropdown: stylex.props(styles.dropdown).className,
  month_grid: stylex.props(styles.grid).className,
  weekday: stylex.props(styles.weekday).className,
  week_number: stylex.props(styles.weekNumber).className,
  week_number_header: stylex.props(styles.weekNumber).className,
};

const dropdownClassNames: Partial<ClassNames> = {
  ...classNames,
  caption_label: stylex.props(styles.captionLabel, styles.dropdownLabel).className,
};

const components: Partial<CustomComponents> = {
  Root,
  Chevron,
  PreviousMonthButton: NavButton,
  NextMonthButton: NavButton,
  Day,
  DayButton,
};

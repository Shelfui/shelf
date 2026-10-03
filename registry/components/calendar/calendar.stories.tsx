import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { Calendar } from "./calendar";

const meta = preview.meta({
  title: "Components/Calendar",
  parameters: { figma: {} },
});

// A fixed month and "today", so the stories render the same every day.
const month = new Date(2026, 0);
const today = new Date(2026, 0, 20);

const day = (name: RegExp | string) => ({ name });
const cell = (button: HTMLElement) => button.closest("td")!;

function SingleDate() {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <Calendar mode="single" defaultMonth={month} today={today} selected={date} onSelect={setDate} />
  );
}

/** Clicking a day selects it; the previous and next buttons change the month. */
export const Default = meta.story({
  render: () => <SingleDate />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("January 2026")).toBeInTheDocument();
    await expect(canvas.getByRole("button", day(/^Today, Tuesday, January 20th/))).toBeVisible();

    await userEvent.click(canvas.getByRole("button", day("Thursday, January 15th, 2026")));

    const selected = canvas.getByRole("button", day("Thursday, January 15th, 2026, selected"));
    await expect(cell(selected)).toHaveAttribute("aria-selected", "true");

    await userEvent.click(canvas.getByRole("button", { name: /next month/i }));
    await expect(canvas.getByText("February 2026")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: /previous month/i }));
    await expect(canvas.getByText("January 2026")).toBeInTheDocument();
  },
});

function DateRangeCalendar() {
  const [range, setRange] = useState<DateRange | undefined>();
  return (
    <Calendar
      mode="range"
      defaultMonth={month}
      today={today}
      numberOfMonths={2}
      selected={range}
      onSelect={setRange}
    />
  );
}

/** The first click starts the range and the second ends it; the days between fill in. */
export const Range = meta.story({
  render: () => <DateRangeCalendar />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("February 2026")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", day("Monday, January 12th, 2026")));
    await userEvent.click(canvas.getByRole("button", day("Friday, January 16th, 2026")));

    const start = canvas.getByRole("button", day("Monday, January 12th, 2026, selected"));
    const middle = canvas.getByRole("button", day("Wednesday, January 14th, 2026, selected"));
    const end = canvas.getByRole("button", day("Friday, January 16th, 2026, selected"));

    await expect(cell(start)).toHaveAttribute("aria-selected", "true");
    await expect(cell(middle)).toHaveAttribute("aria-selected", "true");
    await expect(cell(end)).toHaveAttribute("aria-selected", "true");
    await expect(
      cell(canvas.getByRole("button", day("Saturday, January 17th, 2026"))),
    ).not.toHaveAttribute("aria-selected");

    // The middle cell is shaded as part of the range; the ends are filled.
    await expect(getComputedStyle(cell(middle)).backgroundColor).toBe("rgb(235, 235, 235)");
    await waitFor(() => expect(getComputedStyle(start).backgroundColor).toBe("rgb(23, 23, 23)"));
  },
});

/** Arrow keys move focus by day and week, across into the next month. */
export const KeyboardNavigation = meta.story({
  render: () => <SingleDate />,
  play: async ({ canvas }) => {
    const focused = (name: string) =>
      waitFor(() => expect(canvas.getByRole("button", day(name))).toHaveFocus());

    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await focused("Today, Tuesday, January 20th, 2026");

    await userEvent.keyboard("{ArrowRight}");
    await focused("Wednesday, January 21st, 2026");

    await userEvent.keyboard("{ArrowDown}");
    await focused("Wednesday, January 28th, 2026");

    await userEvent.keyboard("{ArrowLeft}");
    await focused("Tuesday, January 27th, 2026");

    await userEvent.keyboard("{ArrowUp}");
    await focused("Today, Tuesday, January 20th, 2026");

    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await focused("Tuesday, February 3rd, 2026");
    await expect(canvas.getByText("February 2026")).toBeInTheDocument();

    await userEvent.keyboard("{Enter}");
    await expect(
      canvas.getByRole("button", day("Tuesday, February 3rd, 2026, selected")),
    ).toHaveFocus();
  },
});

const selectWeekday = fn();

/** Disabled days are dimmed and cannot be selected. */
export const DisabledDays = meta.story({
  render: () => (
    <Calendar
      mode="single"
      defaultMonth={month}
      today={today}
      disabled={{ dayOfWeek: [0, 6] }}
      onSelect={selectWeekday}
    />
  ),
  play: async ({ canvas }) => {
    selectWeekday.mockClear();
    const saturday = canvas.getByRole("button", day("Saturday, January 10th, 2026"));

    await expect(saturday).toBeDisabled();
    await expect(getComputedStyle(saturday).opacity).toBe("0.5");

    await userEvent.click(saturday);
    await expect(selectWeekday).not.toHaveBeenCalled();
    await expect(cell(saturday)).not.toHaveAttribute("aria-selected");

    await userEvent.click(canvas.getByRole("button", day("Friday, January 9th, 2026")));
    await expect(selectWeekday).toHaveBeenCalledTimes(1);
  },
});

/** `captionLayout="dropdown"` swaps the caption for month and year menus. */
export const Dropdowns = meta.story({
  render: () => (
    <Calendar
      mode="single"
      captionLayout="dropdown"
      defaultMonth={month}
      today={today}
      startMonth={new Date(2020, 0)}
      endMonth={new Date(2030, 11)}
    />
  ),
  play: async ({ canvas }) => {
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: /month/i }), "March");
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: /year/i }), "2028");

    await expect(canvas.getByRole("button", day("Wednesday, March 15th, 2028"))).toBeVisible();
  },
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => (
    <Calendar mode="single" defaultMonth={month} today={today} selected={new Date(2026, 0, 15)} />
  ),
  play: async ({ canvas }) => {
    const selected = canvas.getByRole("button", day("Thursday, January 15th, 2026, selected"));
    const outside = canvas.getByRole("button", day("Sunday, December 28th, 2025"));

    await expect(getComputedStyle(selected).backgroundColor).toBe("rgb(237, 237, 237)");
    await expect(getComputedStyle(selected).color).toBe("rgb(10, 10, 10)");
    await expect(getComputedStyle(outside).color).toBe("rgb(161, 161, 161)");
  },
});

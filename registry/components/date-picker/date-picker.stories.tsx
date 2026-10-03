import * as stylex from "@stylexjs/stylex";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { spacing } from "../../foundations/tokens.stylex";
import { Label } from "../label/label";
import { DatePicker, DateRangePicker } from "./date-picker";

const meta = preview.meta({
  title: "Components/Date Picker",
  // The calendar renders in a portal on <body>, outside the story root.
  parameters: { figma: {}, a11y: { context: "body" } },
});

const format = (date: Date) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);

const closed = () =>
  waitFor(() => {
    if (screen.queryByRole("dialog")) throw new Error("calendar is still open");
  });

const changed = fn();

function DueDate(props: { defaultValue?: Date }) {
  return (
    <div {...stylex.props(styles.field)}>
      <Label htmlFor="due-date">Due date</Label>
      <DatePicker id="due-date" onValueChange={changed} {...props} />
    </div>
  );
}

/** Opens on today, picks a day from the keyboard, then closes and shows it in the trigger. */
export const Default = meta.story({
  render: () => <DueDate />,
  play: async ({ canvas }) => {
    changed.mockClear();
    const trigger = canvas.getByRole("button", { name: "Due date" });
    await expect(trigger).toHaveTextContent("Pick a date");

    await userEvent.click(trigger);
    await screen.findByRole("dialog", { name: "Choose a date" });
    await waitFor(() => expect(screen.getByRole("button", { name: /^Today, / })).toHaveFocus());

    await userEvent.keyboard("{ArrowRight}{Enter}");
    await closed();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    await expect(changed).toHaveBeenCalledWith(tomorrow);
    await expect(trigger).toHaveTextContent(format(tomorrow));
    await waitFor(() => expect(trigger).toHaveFocus());
  },
});

/** Opens on the picked month with the picked day focused; clicking another day replaces it. */
export const PicksADate = meta.story({
  render: () => <DueDate defaultValue={new Date(2026, 0, 15)} />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Due date" });
    await expect(trigger).toHaveTextContent(format(new Date(2026, 0, 15)));

    await userEvent.click(trigger);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Thursday, January 15th, 2026, selected" }),
      ).toHaveFocus(),
    );

    await userEvent.click(screen.getByRole("button", { name: "Tuesday, January 20th, 2026" }));
    await closed();

    await expect(trigger).toHaveTextContent(format(new Date(2026, 0, 20)));
    await waitFor(() => expect(trigger).toHaveFocus());
  },
});

/** Escape closes the calendar without changing the value. */
export const Escape = meta.story({
  render: () => <DueDate defaultValue={new Date(2026, 0, 15)} />,
  play: async ({ canvas }) => {
    changed.mockClear();
    const trigger = canvas.getByRole("button", { name: "Due date" });

    await userEvent.click(trigger);
    await screen.findByRole("dialog");

    await userEvent.keyboard("{ArrowRight}{Escape}");
    await closed();

    await expect(changed).not.toHaveBeenCalled();
    await expect(trigger).toHaveTextContent(format(new Date(2026, 0, 15)));
    await waitFor(() => expect(trigger).toHaveFocus());
  },
});

export const Disabled = meta.story({
  render: () => <DatePicker aria-label="Due date" disabled />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Due date" })).toBeDisabled();
  },
});

/** The first click starts a new range, the second ends it and closes the calendar. */
export const Range = meta.story({
  render: () => (
    <DateRangePicker
      aria-label="Stay"
      defaultValue={{ from: new Date(2026, 0, 5), to: new Date(2026, 0, 8) }}
    />
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Stay" });
    const range = (from: Date, to: Date) => `${format(from)} – ${format(to)}`;

    await expect(trigger).toHaveTextContent(range(new Date(2026, 0, 5), new Date(2026, 0, 8)));

    await userEvent.click(trigger);
    await screen.findByRole("dialog", { name: "Choose a date range" });

    await userEvent.click(screen.getByRole("button", { name: "Monday, January 12th, 2026" }));
    await expect(screen.getByRole("dialog")).toBeVisible();
    await expect(trigger).toHaveTextContent(format(new Date(2026, 0, 12)));

    await userEvent.click(screen.getByRole("button", { name: "Tuesday, February 3rd, 2026" }));
    await closed();

    await expect(trigger).toHaveTextContent(range(new Date(2026, 0, 12), new Date(2026, 1, 3)));
  },
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <DueDate defaultValue={new Date(2026, 0, 15)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Due date" }));
    const popover = await screen.findByRole("dialog");
    const calendar = popover.querySelector<HTMLElement>('[data-slot="calendar"]')!;
    const selected = screen.getByRole("button", { name: /January 15th, 2026, selected/ });

    await expect(getComputedStyle(popover).backgroundColor).toBe("rgb(23, 23, 23)");
    await expect(getComputedStyle(calendar).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    await expect(getComputedStyle(selected).backgroundColor).toBe("rgb(237, 237, 237)");
  },
});

const styles = stylex.create({
  field: { gap: spacing["2"], display: "grid" },
});

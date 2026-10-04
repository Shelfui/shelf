import { expect, fn, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { TimePicker } from "./time-picker";

const meta = preview.meta({
  title: "Components/Time Picker",
  component: TimePicker,
  parameters: { a11y: { context: "body" } },
  args: { "aria-label": "Start time", defaultValue: "09:30", onValueChange: fn() },
});

/** Arrow keys step each field and report a 24-hour string. */
export const Default = meta.story({
  play: async ({ canvas, args }) => {
    const hours = canvas.getByRole("textbox", { name: "Hours" });
    await expect(hours).toHaveValue("09");
    await expect(canvas.getByRole("textbox", { name: "Minutes" })).toHaveValue("30");

    hours.focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("10:30");

    const minutes = canvas.getByRole("textbox", { name: "Minutes" });
    minutes.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("10:29");
  },
});

/** Twelve-hour mode shows 1 to 12 and an AM/PM list but still reports 24-hour values. */
export const TwelveHour = meta.story({
  args: { hour12: true, defaultValue: "13:15" },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole("textbox", { name: "Hours" })).toHaveValue("01");
    const period = canvas.getByRole("combobox", { name: "AM or PM" });
    await expect(period).toHaveTextContent("PM");

    await userEvent.click(period);
    await userEvent.click(await screen.findByRole("option", { name: "AM" }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith("01:15");
    // Let the list finish closing, so its focus guards are gone when accessibility is checked.
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  },
});

export const Disabled = meta.story({
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Hours" })).toBeDisabled();
  },
});

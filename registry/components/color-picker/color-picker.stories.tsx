import { expect, fn, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { ColorPicker, normalizeHex } from "./color-picker";

const meta = preview.meta({
  title: "Components/Color Picker",
  component: ColorPicker,
  args: { "aria-label": "Accent color", onValueChange: fn() },
});

/** Pick a swatch, or type any hex color; shorthand like #0f0 is expanded. */
export const Default = meta.story({
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Blue" }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith("#3b82f6");
    await expect(canvas.getByRole("textbox", { name: "Hex color" })).toHaveValue("#3b82f6");

    const hex = canvas.getByRole("textbox", { name: "Hex color" });
    await userEvent.clear(hex);
    await userEvent.type(hex, "#0f0");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("#00ff00");
  },
});

/** Half-typed text is flagged and never reported; leaving the field restores the real color. */
export const InvalidHex = meta.story({
  args: { defaultValue: "#ef4444" },
  play: async ({ canvas, args }) => {
    const hex = canvas.getByRole("textbox", { name: "Hex color" });
    await userEvent.clear(hex);
    await userEvent.type(hex, "#zz");
    await expect(hex).toHaveAttribute("aria-invalid", "true");
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.tab();
    await expect(hex).toHaveValue("#ef4444");
  },
});

export const NormalizesHex = meta.story({
  render: () => <p>{normalizeHex("ABC")}</p>,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("#aabbcc")).toBeVisible();
    await expect(normalizeHex("nope")).toBeUndefined();
  },
});

import { expect, fn, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { Rating } from "./rating";

const meta = preview.meta({
  title: "Components/Rating",
  component: Rating,
  args: { "aria-label": "Rate this answer", onValueChange: fn() },
});

/** Click or use arrow keys; each star is named for what choosing it means. */
export const Default = meta.story({
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "4 stars" }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(4);
    await expect(canvas.getByRole("radio", { name: "4 stars" })).toBeChecked();
  },
});

export const Keyboard = meta.story({
  args: { defaultValue: 2 },
  play: async ({ canvas, args }) => {
    canvas.getByRole("radio", { name: "2 stars" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(3);
  },
});

/** Shows an average as a single labelled image. */
export const ReadOnly = meta.story({
  args: { readOnly: true, value: 3, "aria-label": "Average rating" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "Average rating: 3 out of 5" })).toBeVisible();
    await expect(canvas.queryAllByRole("radio")).toHaveLength(0);
  },
});

export const Disabled = meta.story({
  args: { disabled: true, defaultValue: 2 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("radio", { name: "2 stars" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  },
});

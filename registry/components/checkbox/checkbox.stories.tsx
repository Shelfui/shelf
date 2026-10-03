import { expect, fn, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { Label } from "../label/label";
import { Checkbox } from "./checkbox";

const meta = preview.meta({
  title: "Components/Checkbox",
  component: Checkbox,
  args: { "aria-label": "Accept terms" },
  argTypes: {
    defaultChecked: { name: "Checked", control: "boolean" },
    disabled: { control: "boolean" },
  },
  parameters: { figma: { states: ["focus-visible"] } },
});

export const Default = meta.story({
  args: { onCheckedChange: fn() },
  play: async ({ args, canvas }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Accept terms" });

    await userEvent.click(checkbox);

    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true, expect.anything());
    await expect(getComputedStyle(checkbox).backgroundColor).toBe("rgb(23, 23, 23)");

    await userEvent.keyboard(" ");

    await expect(checkbox).not.toBeChecked();
  },
});

export const WithLabel = meta.story({
  args: { "aria-label": undefined },
  render: (args) => (
    <Label>
      <Checkbox {...args} defaultChecked /> Email me about product updates
    </Label>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("checkbox", { name: "Email me about product updates" }),
    ).toBeChecked();
  },
});

/** Shows a dash and reports `aria-checked="mixed"`. */
export const Indeterminate = meta.story({
  args: { indeterminate: true },
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole("checkbox");

    await expect(checkbox).toHaveAttribute("aria-checked", "mixed");
    await expect(checkbox.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  },
});

export const Disabled = meta.story({
  args: { disabled: true, defaultChecked: true },
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole("checkbox");

    await userEvent.click(checkbox);

    await expect(checkbox).toBeChecked();
    await expect(checkbox).toHaveAttribute("aria-disabled", "true");
  },
});

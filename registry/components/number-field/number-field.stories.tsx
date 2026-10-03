import { expect, fn, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import * as NumberField from "./number-field";

const meta = preview.meta({
  title: "Components/Number Field",
  component: NumberField.Root,
  args: { defaultValue: 1, min: 0, max: 3, onValueChange: fn() },
  render: (args) => (
    <NumberField.Root {...args}>
      <NumberField.Group>
        <NumberField.Decrement />
        <NumberField.Input aria-label="Quantity" />
        <NumberField.Increment />
      </NumberField.Group>
    </NumberField.Root>
  ),
  parameters: { figma: {} },
});

/** The buttons and arrow keys step the value and stop at `min` and `max`. */
export const Default = meta.story({
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Quantity" });
    const increase = canvas.getByRole("button", { name: "Increase" });

    await userEvent.click(increase);

    await expect(input).toHaveValue("2");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(2, expect.anything());

    await userEvent.click(increase);
    await userEvent.click(increase);

    await expect(input).toHaveValue("3");
    await expect(increase).toBeDisabled();

    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}");

    await expect(input).toHaveValue("2");
  },
});

export const Currency = meta.story({
  args: {
    defaultValue: 1250,
    max: undefined,
    format: { style: "currency", currency: "USD" },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Quantity" })).toHaveValue("$1,250.00");
  },
});

export const Disabled = meta.story({
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox")).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Increase" })).toBeDisabled();
  },
});

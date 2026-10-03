import { expect, fn, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { Input } from "./input";

const meta = preview.meta({
  title: "Components/Input",
  component: Input,
  args: { "aria-label": "Email", placeholder: "you@example.com", type: "email" },
  argTypes: {
    disabled: { control: "boolean" },
  },
  parameters: { figma: { states: ["focus-visible"] } },
});

export const Default = meta.story({
  args: { onValueChange: fn() },
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });

    await expect(getComputedStyle(input).borderTopColor).toBe("rgb(224, 224, 224)");

    await userEvent.type(input, "ada@example.com");

    await expect(input).toHaveValue("ada@example.com");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("ada@example.com", expect.anything());
    await expect(getComputedStyle(input).borderTopColor).toBe("rgb(143, 143, 143)");
  },
});

export const Invalid = meta.story({
  args: { "aria-invalid": true, defaultValue: "not-an-email" },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox");

    await expect(input).toBeInvalid();
    await expect(getComputedStyle(input).borderTopColor).toBe("oklch(0.577 0.245 27.3)");
  },
});

export const Disabled = meta.story({
  args: { disabled: true, defaultValue: "ada@example.com" },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox");

    await expect(input).toBeDisabled();
    await expect(getComputedStyle(input).opacity).toBe("0.5");
  },
});

export const File = meta.story({
  args: { "aria-label": "Receipt", type: "file", placeholder: undefined },
});

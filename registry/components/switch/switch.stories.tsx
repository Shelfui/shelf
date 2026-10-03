import { expect, fn, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { Label } from "../label/label";
import { Switch } from "./switch";

const meta = preview.meta({
  title: "Components/Switch",
  component: Switch,
  args: { "aria-label": "Airplane mode" },
  argTypes: {
    defaultChecked: { name: "Checked", control: "boolean" },
    disabled: { control: "boolean" },
  },
  parameters: { figma: { states: ["focus-visible"] } },
});

export const Default = meta.story({
  args: { onCheckedChange: fn() },
  play: async ({ args, canvas }) => {
    const control = canvas.getByRole("switch", { name: "Airplane mode" });
    const thumb = control.querySelector("[data-slot=switch-thumb]");

    await expect(control).not.toBeChecked();

    await userEvent.click(control);

    await expect(control).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true, expect.anything());
    await expect(getComputedStyle(control).backgroundColor).toBe("rgb(23, 23, 23)");
    await expect(thumb && getComputedStyle(thumb).transform).not.toBe("none");
  },
});

export const WithLabel = meta.story({
  args: { "aria-label": undefined },
  render: (args) => (
    <Label>
      <Switch {...args} defaultChecked /> Wi-Fi
    </Label>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("switch", { name: "Wi-Fi" })).toBeChecked();
  },
});

export const Disabled = meta.story({
  args: { disabled: true },
  play: async ({ canvas }) => {
    const control = canvas.getByRole("switch");

    await userEvent.click(control);

    await expect(control).not.toBeChecked();
  },
});

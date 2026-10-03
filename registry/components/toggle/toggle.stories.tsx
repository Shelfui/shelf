import { expect, fn, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { PlusIcon } from "../icons/icons";
import { Toggle, type ToggleSize, type ToggleVariant } from "./toggle";

const VARIANTS: ToggleVariant[] = ["default", "outline"];
const SIZES: ToggleSize[] = ["sm", "default", "lg"];
const SIZE_LABELS: Record<ToggleSize, string> = { sm: "Small", default: "Default", lg: "Large" };

const meta = preview.meta({
  title: "Components/Toggle",
  component: Toggle,
  args: { children: "Bold" },
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    size: { control: { type: "select", labels: SIZE_LABELS }, options: SIZES },
    defaultPressed: { name: "Pressed", control: "boolean" },
    disabled: { control: "boolean" },
  },
  parameters: { figma: { states: ["hover", "focus-visible"] } },
});

export const Default = meta.story({
  args: { onPressedChange: fn() },
  play: async ({ args, canvas }) => {
    const toggle = canvas.getByRole("button", { name: "Bold" });

    await expect(toggle).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(toggle);

    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(true, expect.anything());
    await expect(getComputedStyle(toggle).backgroundColor).toBe("rgb(235, 235, 235)");
  },
});

export const Outline = meta.story({
  args: { variant: "outline" },
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByRole("button")).borderTopColor).toBe(
      "rgb(224, 224, 224)",
    );
  },
});

export const Sizes = meta.story({
  render: (args) => (
    <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
      <Toggle {...args} size="sm">
        Small
      </Toggle>
      <Toggle {...args}>Default</Toggle>
      <Toggle {...args} size="lg">
        Large
      </Toggle>
    </div>
  ),
  play: async ({ canvas }) => {
    const heights = canvas
      .getAllByRole("button")
      .map((toggle) => toggle.getBoundingClientRect().height);

    await expect(heights).toEqual([28, 32, 36]);
  },
});

export const IconOnly = meta.story({
  args: { "aria-label": "Add", children: <PlusIcon /> },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Add" })).toBeInTheDocument();
  },
});

export const Disabled = meta.story({
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button")).toBeDisabled();
  },
});

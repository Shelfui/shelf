import { expect, fn, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { Slider } from "./slider";

const meta = preview.meta({
  title: "Components/Slider",
  component: Slider,
  decorators: [(Story) => <div style={{ width: 280 }}>{Story()}</div>],
  parameters: { figma: {} },
});

export const Default = meta.story({
  args: { "aria-label": "Volume", defaultValue: 50, onValueChange: fn() },
  play: async ({ args, canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });

    await expect(thumb).toHaveValue("50");

    await userEvent.click(thumb);
    await userEvent.keyboard("{ArrowRight}");

    await expect(thumb).toHaveValue("51");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(51, expect.anything());

    await userEvent.keyboard("{End}");

    await expect(thumb).toHaveValue("100");
  },
});

/** An array value renders one thumb per value, each with its own name. */
export const Range = meta.story({
  args: {
    defaultValue: [20, 80],
    getAriaLabel: (index: number) => ["Minimum price", "Maximum price"][index] ?? "",
  },
  play: async ({ canvas }) => {
    const min = canvas.getByRole("slider", { name: "Minimum price" });
    const max = canvas.getByRole("slider", { name: "Maximum price" });

    await expect(min).toHaveValue("20");
    await expect(max).toHaveValue("80");
  },
});

export const Disabled = meta.story({
  args: { "aria-label": "Volume", defaultValue: 30, disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("slider")).toBeDisabled();
  },
});

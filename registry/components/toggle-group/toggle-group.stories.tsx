import { expect, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { Toggle } from "../toggle/toggle";
import { ToggleGroup } from "./toggle-group";

const meta = preview.meta({
  title: "Components/Toggle Group",
  component: ToggleGroup,
  args: { "aria-label": "Text alignment", defaultValue: ["left"] },
  render: (args) => (
    <ToggleGroup {...args}>
      <Toggle value="left" variant="outline">
        Left
      </Toggle>
      <Toggle value="center" variant="outline">
        Center
      </Toggle>
      <Toggle value="right" variant="outline">
        Right
      </Toggle>
    </ToggleGroup>
  ),
  parameters: { figma: {} },
});

/** One toggle is pressed at a time, and arrow keys move focus between them. */
export const Default = meta.story({
  play: async ({ canvas }) => {
    const left = canvas.getByRole("button", { name: "Left" });
    const center = canvas.getByRole("button", { name: "Center" });

    await expect(left).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(center);

    await expect(center).toHaveAttribute("aria-pressed", "true");
    await expect(left).toHaveAttribute("aria-pressed", "false");

    await userEvent.keyboard("{ArrowRight}");

    await expect(canvas.getByRole("button", { name: "Right" })).toHaveFocus();
  },
});

export const Multiple = meta.story({
  args: { multiple: true },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Right" }));

    await expect(canvas.getByRole("button", { name: "Left" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(canvas.getByRole("button", { name: "Right" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  },
});

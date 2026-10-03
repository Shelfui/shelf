import { expect, fn, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { Label } from "../label/label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const meta = preview.meta({
  title: "Components/Radio Group",
  component: RadioGroup,
  args: { "aria-label": "Plan", defaultValue: "starter", onValueChange: fn() },
  render: (args) => (
    <RadioGroup {...args}>
      <Label>
        <RadioGroupItem value="starter" /> Starter
      </Label>
      <Label>
        <RadioGroupItem value="pro" /> Pro
      </Label>
      <Label>
        <RadioGroupItem value="enterprise" /> Enterprise
      </Label>
    </RadioGroup>
  ),
  parameters: { figma: {} },
});

/** Arrow keys move the selection; Tab moves in and out of the group as one stop. */
export const Default = meta.story({
  play: async ({ args, canvas }) => {
    const starter = canvas.getByRole("radio", { name: "Starter" });

    await expect(starter).toBeChecked();

    await userEvent.click(starter);
    await userEvent.keyboard("{ArrowDown}");

    const pro = canvas.getByRole("radio", { name: "Pro" });
    await expect(pro).toBeChecked();
    await expect(pro).toHaveFocus();
    await expect(starter).not.toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith("pro", expect.anything());
    await expect(pro.querySelector("[data-slot=radio-group-indicator]")).toBeVisible();
    await waitFor(() =>
      expect(starter.querySelector("[data-slot=radio-group-indicator]")).toBeNull(),
    );
  },
});

export const Disabled = meta.story({
  args: { disabled: true },
  play: async ({ canvas }) => {
    for (const radio of canvas.getAllByRole("radio")) {
      await expect(radio).toHaveAttribute("aria-disabled", "true");
    }
  },
});

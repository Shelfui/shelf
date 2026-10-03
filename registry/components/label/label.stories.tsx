import { expect, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { Checkbox } from "../checkbox/checkbox";
import { Input } from "../input/input";
import { Label } from "./label";

const meta = preview.meta({
  title: "Components/Label",
  component: Label,
  parameters: { figma: {} },
});

/** `htmlFor` names the control, and clicking the label focuses it. */
export const Default = meta.story({
  render: () => (
    <div style={{ display: "grid", gap: 8, width: 280 }}>
      <Label htmlFor="label-email">Email</Label>
      <Input id="label-email" type="email" />
    </div>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText("Email");

    await userEvent.click(canvas.getByText("Email"));

    await expect(input).toHaveFocus();
  },
});

/** Wrapping a control also labels it; clicking the text toggles the checkbox. */
export const WrappingACheckbox = meta.story({
  render: () => (
    <Label>
      <Checkbox /> Accept terms and conditions
    </Label>
  ),
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Accept terms and conditions" });

    await userEvent.click(canvas.getByText("Accept terms and conditions"));

    await expect(checkbox).toBeChecked();
  },
});

import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Stepper from "./stepper";

const meta = preview.meta({ title: "Components/Stepper", parameters: { figma: {} } });

/** The current step is announced as the current step; completed ones say so. */
export const Default = meta.story({
  render: () => (
    <Stepper.Root aria-label="Checkout">
      <Stepper.Step status="complete">
        <Stepper.Title>Cart</Stepper.Title>
      </Stepper.Step>
      <Stepper.Step status="current">
        <Stepper.Title>Payment</Stepper.Title>
        <Stepper.Description>Card or invoice</Stepper.Description>
      </Stepper.Step>
      <Stepper.Step>
        <Stepper.Title>Review</Stepper.Title>
      </Stepper.Step>
    </Stepper.Root>
  ),
  play: async ({ canvas }) => {
    const items = canvas.getAllByRole("listitem");
    await expect(items).toHaveLength(3);
    await expect(items[1]).toHaveAttribute("aria-current", "step");
    await expect(items[0]).not.toHaveAttribute("aria-current");
    await expect(canvas.getByText("Complete")).toBeInTheDocument();
  },
});

import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import { CloseIcon } from "../icons/icons";
import * as Alert from "./alert";

const VARIANTS: Alert.AlertVariant[] = ["default", "destructive"];

const meta = preview.meta({
  title: "Components/Alert",
  component: Alert.Root,
  decorators: [(Story) => <div style={{ width: 420 }}>{Story()}</div>],
  argTypes: {
    variant: { control: "select", options: VARIANTS },
  },
  parameters: { figma: {} },
});

export const Default = meta.story({
  render: (args) => (
    <Alert.Root {...args}>
      <Alert.Title>Invoices are sent at 9:00</Alert.Title>
      <Alert.Description>You can change the time in settings.</Alert.Description>
    </Alert.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toHaveTextContent("Invoices are sent at 9:00");
  },
});

/** An icon first sits beside the title and description. */
export const Destructive = meta.story({
  render: () => (
    <Alert.Root variant="destructive">
      <CloseIcon />
      <Alert.Title>Payment failed</Alert.Title>
      <Alert.Description>Update your card to keep your plan.</Alert.Description>
    </Alert.Root>
  ),
  play: async ({ canvas }) => {
    const title = canvas.getByText("Payment failed");
    const icon = canvas.getByRole("alert").querySelector("svg")!;

    await expect(getComputedStyle(title).color).toBe("oklch(0.5 0.2 27.3)");
    await expect(icon.getBoundingClientRect().right).toBeLessThan(
      title.getBoundingClientRect().left,
    );
  },
});

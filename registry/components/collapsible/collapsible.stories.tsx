import { expect, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { Button } from "../button/button";
import * as Collapsible from "./collapsible";

const meta = preview.meta({
  title: "Components/Collapsible",
  component: Collapsible.Root,
  parameters: { figma: {} },
});

export const Default = meta.story({
  render: () => (
    <Collapsible.Root style={{ width: 320 }}>
      <Collapsible.Trigger render={<Button variant="outline" />}>
        Show line items
      </Collapsible.Trigger>
      <Collapsible.Panel>
        <p>Design work: $3,200.00</p>
        <p>Hosting: $120.00</p>
      </Collapsible.Panel>
    </Collapsible.Root>
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Show line items" });

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryByText(/Design work/)).toBeNull();

    await userEvent.click(trigger);

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByText(/Design work/)).toBeVisible();

    await userEvent.click(trigger);

    await waitFor(() => expect(canvas.queryByText(/Design work/)).toBeNull());
  },
});

import type { ComponentProps } from "react";
import { expect, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Accordion from "./accordion";

const meta = preview.meta({
  title: "Components/Accordion",
  component: Accordion.Root,
  decorators: [(Story) => <div style={{ width: 420 }}>{Story()}</div>],
  parameters: { figma: {} },
});

function Faq(props: ComponentProps<typeof Accordion.Root>) {
  return (
    <Accordion.Root {...props}>
      <Accordion.Item value="billing">
        <Accordion.Trigger>How does billing work?</Accordion.Trigger>
        <Accordion.Panel>You pay monthly, and can cancel any time.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="refunds">
        <Accordion.Trigger>Can I get a refund?</Accordion.Trigger>
        <Accordion.Panel>Yes, within 30 days of your first payment.</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}

/** Opening one item closes the other, and the open item's chevron turns. */
export const Default = meta.story({
  render: () => <Faq defaultValue={["billing"]} />,
  play: async ({ canvas }) => {
    const billing = canvas.getByRole("button", { name: "How does billing work?" });
    const refunds = canvas.getByRole("button", { name: "Can I get a refund?" });

    await expect(billing).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByText(/You pay monthly/)).toBeVisible();
    await expect(getComputedStyle(billing.querySelector("svg")!).transform).not.toBe("none");
    await expect(getComputedStyle(refunds.querySelector("svg")!).transform).toBe("none");

    await userEvent.click(refunds);

    await expect(refunds).toHaveAttribute("aria-expanded", "true");
    await expect(billing).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(canvas.queryByText(/You pay monthly/)).toBeNull());
  },
});

/** With `multiple`, items open independently. Enter and Space toggle from the keyboard. */
export const Multiple = meta.story({
  render: () => <Faq multiple />,
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.tab();
    await userEvent.keyboard(" ");

    for (const trigger of canvas.getAllByRole("button")) {
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
    }
  },
});

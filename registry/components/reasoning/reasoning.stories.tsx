import { useEffect, useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Reasoning from "./reasoning";

const meta = preview.meta({
  title: "Components/Reasoning",
  component: Reasoning.Root,
  parameters: { layout: "padded" },
});

const THOUGHT = "The user wants the release notes. I should list the three changes in order.";

function Thinking() {
  const [streaming, setStreaming] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setStreaming(false), 300);
    return () => clearTimeout(timer);
  }, []);
  return (
    <Reasoning.Root streaming={streaming} seconds={4}>
      <Reasoning.Trigger />
      <Reasoning.Content>{THOUGHT}</Reasoning.Content>
    </Reasoning.Root>
  );
}

/** Open while streaming; folds away when thinking ends, and the reader can reopen it. */
export const Default = meta.story({
  args: { children: null },
  render: () => <Thinking />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText(THOUGHT)).toBeVisible();
    const trigger = await canvas.findByRole("button", { name: "Thought for 4s" });
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
});

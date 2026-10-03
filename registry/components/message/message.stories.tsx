import { expect, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { RetryIcon } from "../icons/icons";
import * as Message from "./message";

const meta = preview.meta({
  title: "Components/Message",
  component: Message.Root,
  parameters: { layout: "padded" },
});

export const Conversation = meta.story({
  args: { from: "assistant" },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
      <Message.Root from="user">
        <Message.Content>What changed in the last release?</Message.Content>
      </Message.Root>
      <Message.Root from="assistant">
        <Message.Content>Streaming got faster, and code blocks load on demand.</Message.Content>
        <Message.Actions>
          <Message.CopyAction text="Streaming got faster, and code blocks load on demand." />
          <Message.Action label="Retry" icon={<RetryIcon />} />
        </Message.Actions>
      </Message.Root>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("article", { name: "You" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /copy/i }));
  },
});

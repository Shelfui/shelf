import { useEffect, useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Message from "../message/message";
import type { ChatStatus } from "../message/message-types";
import * as Thread from "./thread";

const meta = preview.meta({
  title: "Components/Thread",
  parameters: { layout: "padded", a11y: { context: "body" } },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", flexDirection: "column", height: 320, maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
});

function Messages({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => (
    <Message.Root key={index} from={index % 2 === 0 ? "user" : "assistant"}>
      <Message.Content>Message number {index + 1}</Message.Content>
    </Message.Root>
  ));
}

function Conversation({ count = 30, status }: { count?: number; status?: ChatStatus }) {
  return (
    <Thread.Root status={status}>
      <Thread.Viewport>
        <Thread.Content>
          <Messages count={count} />
        </Thread.Content>
      </Thread.Viewport>
      <Thread.ScrollToLatest />
    </Thread.Root>
  );
}

const nearBottom = (element: HTMLElement) =>
  element.scrollHeight - element.scrollTop - element.clientHeight < 8;

/** A long conversation opens at the newest message. */
export const FollowsLatest = meta.story({
  render: () => <Conversation />,
  play: async ({ canvas }) => {
    const viewport = canvas
      .getByRole("region", { name: "Conversation" })
      .querySelector<HTMLElement>("[data-slot=thread-viewport]")!;
    await waitFor(() => expect(nearBottom(viewport)).toBe(true));
    await expect(canvas.getByText("Message number 30")).toBeVisible();
  },
});

/** Scrolling up stops following and shows a way back, which is hidden while at the bottom. */
export const ScrollAway = meta.story({
  render: () => <Conversation />,
  play: async ({ canvas }) => {
    const viewport = canvas
      .getByRole("region", { name: "Conversation" })
      .querySelector<HTMLElement>("[data-slot=thread-viewport]")!;
    await waitFor(() => expect(nearBottom(viewport)).toBe(true));
    await expect(canvas.queryByRole("button", { name: "Scroll to latest" })).toBeNull();

    viewport.scrollTop = 0;
    viewport.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, bubbles: true }));
    const back = await canvas.findByRole("button", { name: "Scroll to latest" });

    await userEvent.click(back);
    await waitFor(() => expect(nearBottom(viewport)).toBe(true));
  },
});

function Announcing() {
  const [status, setStatus] = useState<ChatStatus>("ready");
  useEffect(() => {
    const start = setTimeout(() => setStatus("streaming"), 50);
    return () => clearTimeout(start);
  }, []);
  return (
    <>
      <Conversation count={3} status={status} />
      <button type="button" onClick={() => setStatus("ready")}>
        Finish
      </button>
    </>
  );
}

/** Only the start and the end of a response are announced, never tokens. */
export const Announcements = meta.story({
  render: () => <Announcing />,
  play: async ({ canvas }) => {
    const status = canvas.getByRole("status");
    await waitFor(() => expect(status).toHaveTextContent("Generating response"));
    await userEvent.click(canvas.getByRole("button", { name: "Finish" }));
    await waitFor(() => expect(status).toHaveTextContent("Response ready"));
  },
});

function Growing() {
  const [lines, setLines] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setLines((n) => Math.min(n + 1, 60)), 30);
    return () => clearInterval(id);
  }, []);
  return (
    <Thread.Root>
      <Thread.Viewport>
        <Thread.Content>
          <Messages count={4} />
          <Message.Root from="assistant">
            <Message.Content>
              {Array.from({ length: lines }, (_, line) => (
                <p key={line}>Streamed line {line + 1}</p>
              ))}
            </Message.Content>
          </Message.Root>
        </Thread.Content>
      </Thread.Viewport>
      <Thread.ScrollToLatest />
    </Thread.Root>
  );
}

/** While a reply grows it stays in view, and scrolling away is respected rather than undone. */
export const LeavesYouWhereYouScrolled = meta.story({
  render: () => <Growing />,
  play: async ({ canvas }) => {
    const viewport = canvas
      .getByRole("region", { name: "Conversation" })
      .querySelector<HTMLElement>("[data-slot=thread-viewport]")!;
    // Wait until there is something to scroll away from, and the view is following it.
    await waitFor(() => expect(viewport.scrollHeight - viewport.clientHeight).toBeGreaterThan(150));
    await waitFor(() => expect(nearBottom(viewport)).toBe(true));

    viewport.scrollTop = 0;
    viewport.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 600));

    await expect(viewport.scrollTop).toBeLessThan(40);
    const back = await canvas.findByRole("button", { name: "Scroll to latest" });
    await userEvent.click(back);
    // Following again: the view reaches the newest line and stays with it.
    await waitFor(() => expect(canvas.getByText("Streamed line 60")).toBeVisible(), {
      timeout: 5000,
    });
  },
});

function Pinning() {
  const { pinToStart } = Thread.useThreadActions();
  return (
    <button type="button" onClick={() => pinToStart("target")}>
      Pin
    </button>
  );
}

/** A marked item can be pinned near the top, with room below for the reply to grow into. */
export const PinsAMessageNearTheTop = meta.story({
  render: () => (
    <Thread.Root>
      <Thread.Viewport>
        <Thread.Content>
          <Messages count={20} />
          <Message.Root from="user" data-thread-item="target">
            <Message.Content>Pin me</Message.Content>
          </Message.Root>
        </Thread.Content>
      </Thread.Viewport>
      <Pinning />
    </Thread.Root>
  ),
  play: async ({ canvas }) => {
    const viewport = canvas
      .getByRole("region", { name: "Conversation" })
      .querySelector<HTMLElement>("[data-slot=thread-viewport]")!;
    await userEvent.click(canvas.getByRole("button", { name: "Pin" }));
    await waitFor(async () => {
      const gap =
        canvas.getByText("Pin me").getBoundingClientRect().top -
        viewport.getBoundingClientRect().top;
      await expect(gap).toBeLessThan(60);
    });
  },
});

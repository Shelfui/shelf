import { useEffect, useState } from "react";
import { expect, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { Stream, type StreamProps } from "./stream";

const meta = preview.meta({
  title: "Components/Stream",
  component: Stream,
  parameters: { layout: "padded" },
});

const DOCUMENT = `## Release notes

Shelf now streams **markdown** with \`inline code\`, [links](https://example.com), and lists:

- Fast, because only the last block re-renders
- Safe, because raw HTML is shown as text
- [x] Accessible tables

| Block | Re-renders |
| --- | --- |
| Settled | never |
| Last | per token |

> Quotes keep their own flow.

\`\`\`ts
export const answer = 42;
\`\`\`
`;

export const Default = meta.story({
  args: { children: DOCUMENT },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Release notes" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "links" })).toHaveAttribute(
      "rel",
      "noopener noreferrer nofollow",
    );
    await expect(canvas.getByRole("region", { name: "Table" })).toBeVisible();
    await expect(canvas.getByRole("checkbox", { name: "Done" })).toBeDisabled();
  },
});

/** Model output is untrusted: HTML shows as text, `javascript:` links lose their target, images stay off. */
export const Untrusted = meta.story({
  args: {
    children:
      '<img src=x onerror="alert(1)">\n\n[click](javascript:alert(1)) ![tracker](https://evil.example/p.png)',
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector("img")).toBeNull();
    await expect(canvas.queryByRole("link", { name: "click" })).toBeNull();
    await expect(canvas.getByText("tracker")).toBeVisible();
  },
});

function StreamingDemo({ animation }: Pick<StreamProps, "animation">) {
  const [length, setLength] = useState(40);
  useEffect(() => {
    const id = setInterval(() => setLength((n) => Math.min(n + 12, DOCUMENT.length)), 60);
    return () => clearInterval(id);
  }, []);
  return (
    <Stream streaming={length < DOCUMENT.length} animation={animation}>
      {DOCUMENT.slice(0, length)}
    </Stream>
  );
}

/** A deterministic stream: unfinished syntax is completed and the open fence stays plain. */
export const Streaming = meta.story({
  args: { children: "" },
  render: () => <StreamingDemo />,
});

/** Each new word eases in and lifts a few pixels. Finished text is plain. */
export const Rise = meta.story({
  args: { children: "" },
  render: () => <StreamingDemo animation="rise" />,
});

/** Paced text without the fade. */
export const NoAnimation = meta.story({
  args: { children: "" },
  render: () => <StreamingDemo animation="none" />,
});

/** While streaming, new words are wrapped for the animation; once done, the text is unwrapped. */
export const WordsOnlyWhileStreaming = meta.story({
  args: { children: "Words arrive one by one", streaming: true, smooth: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll("p span")).toHaveLength(5);
  },
});

/** Assistive technology is told the region is still changing, until the stream ends. */
export const BusyWhileStreaming = meta.story({
  args: { children: "Partial **answer", streaming: true, smooth: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[data-slot=markdown]")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  },
});

/** Nothing is rebuilt or jumps while text arrives: blocks and height only ever grow. */
export const GrowsWithoutJumping = meta.story({
  args: { children: "" },
  render: () => <StreamingDemo />,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>("[data-slot=markdown]")!;
    let blocks = 0;
    let height = 0;
    // Sample often enough to catch a block count that dips for a single frame.
    for (let i = 0; i < 200 && root.getAttribute("aria-busy") !== null; i++) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      const now = {
        blocks: root.querySelectorAll("[data-slot=markdown-block]").length,
        height: root.getBoundingClientRect().height,
      };
      await expect(now.blocks).toBeGreaterThanOrEqual(blocks);
      await expect(now.height).toBeGreaterThanOrEqual(height - 1);
      blocks = now.blocks;
      height = now.height;
    }
    await waitFor(() => expect(root).not.toHaveAttribute("aria-busy"), { timeout: 8000 });
  },
});

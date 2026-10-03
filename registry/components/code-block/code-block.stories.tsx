import { expect, waitFor, within } from "storybook/test";
import preview from "@/.storybook/preview";
import { CodeBlock } from "./code-block";

const meta = preview.meta({
  title: "Components/CodeBlock",
  component: CodeBlock,
  parameters: { layout: "padded" },
});

const SOURCE = `import { useState } from "react";

// Count clicks.
export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`;

export const Default = meta.story({
  args: { code: SOURCE, language: "tsx" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Plain text is there at once; colors arrive when the grammar loads.
    await expect(canvas.getByText("tsx")).toBeVisible();
    await waitFor(
      () => expect(canvasElement.querySelectorAll("code span").length).toBeGreaterThan(3),
      {
        timeout: 10_000,
      },
    );
    await expect(canvas.getByRole("button", { name: "Copy code" })).toBeVisible();
  },
});

export const UnknownLanguage = meta.story({
  args: { code: "plain text, nothing to color", language: "brainfuck" },
});

/** While the fence is open: plain text and no copy button, nothing re-tokenized per token. */
export const Streaming = meta.story({
  args: { code: SOURCE.slice(0, 80), language: "tsx", streaming: true },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("button", { name: /copy/i })).toBeNull();
  },
});

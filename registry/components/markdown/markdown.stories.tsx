import { useEffect, useState } from "react";
import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import { Markdown } from "./markdown";

const meta = preview.meta({
  title: "Components/Markdown",
  component: Markdown,
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

function StreamingDemo() {
  const [length, setLength] = useState(40);
  useEffect(() => {
    const id = setInterval(() => setLength((n) => Math.min(n + 12, DOCUMENT.length)), 60);
    return () => clearInterval(id);
  }, []);
  return <Markdown streaming={length < DOCUMENT.length}>{DOCUMENT.slice(0, length)}</Markdown>;
}

/** A deterministic stream: unfinished syntax is completed and the open fence stays plain. */
export const Streaming = meta.story({
  args: { children: "" },
  render: () => <StreamingDemo />,
});

import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import { Kbd } from "./kbd";

const meta = preview.meta({
  title: "Components/Kbd",
  component: Kbd,
  parameters: { figma: {} },
});

export const Default = meta.story({
  render: () => (
    <p>
      Search with <Kbd>⌘</Kbd> <Kbd>K</Kbd>
    </p>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("K").tagName).toBe("KBD");
  },
});

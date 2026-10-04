import { expect, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { CopyButton } from "./copy-button";

const meta = preview.meta({
  title: "Components/Copy Button",
  component: CopyButton,
  args: { text: "bunx shelf add button" },
});

/** Icon only, named for screen readers. */
export const Default = meta.story({
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Copy" })).toBeVisible();
  },
});

/** With the word next to the icon. */
export const WithLabel = meta.story({
  args: { showLabel: true, label: "Copy command" },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Copy command" });
    await expect(button).toHaveTextContent("Copy command");
    // Without clipboard permission the write is refused and the button stays as it was.
    await userEvent.click(button);
    await expect(button).toBeEnabled();
  },
});

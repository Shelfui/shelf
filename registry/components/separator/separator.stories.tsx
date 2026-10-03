import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import { Separator } from "./separator";

const meta = preview.meta({
  title: "Components/Separator",
  component: Separator,
  parameters: { figma: {} },
});

export const Horizontal = meta.story({
  render: () => (
    <div style={{ display: "grid", gap: 12, width: 280 }}>
      <span>Invoices</span>
      <Separator />
      <span>Customers</span>
    </div>
  ),
  play: async ({ canvas }) => {
    const separator = canvas.getByRole("separator");

    await expect(separator.getBoundingClientRect().height).toBe(1);
    await expect(separator.getBoundingClientRect().width).toBe(280);
  },
});

export const Vertical = meta.story({
  render: () => (
    <div style={{ alignItems: "center", display: "flex", gap: 12, height: 20 }}>
      <span>Docs</span>
      <Separator orientation="vertical" />
      <span>Source</span>
    </div>
  ),
  play: async ({ canvas }) => {
    const separator = canvas.getByRole("separator");

    await expect(separator).toHaveAttribute("aria-orientation", "vertical");
    await expect(separator.getBoundingClientRect().width).toBe(1);
    await expect(separator.getBoundingClientRect().height).toBe(20);
  },
});

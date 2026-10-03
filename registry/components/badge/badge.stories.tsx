import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import { Badge, type BadgeVariant } from "./badge";

const VARIANTS: BadgeVariant[] = ["default", "secondary", "outline", "destructive"];

const meta = preview.meta({
  title: "Components/Badge",
  component: Badge,
  args: { children: "Paid" },
  argTypes: {
    variant: { control: "select", options: VARIANTS },
  },
  parameters: { figma: {} },
});

export const Default = meta.story({
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByText("Paid")).backgroundColor).toBe(
      "rgb(23, 23, 23)",
    );
  },
});

export const Variants = meta.story({
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Badge>Paid</Badge>
      <Badge variant="secondary">Draft</Badge>
      <Badge variant="outline">Scheduled</Badge>
      <Badge variant="destructive">Overdue</Badge>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByText("Overdue")).backgroundColor).toBe(
      "oklch(0.53 0.22 27.3)",
    );
  },
});

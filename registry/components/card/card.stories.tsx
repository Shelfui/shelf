import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import { Button } from "../button/button";
import * as Card from "./card";

const meta = preview.meta({
  title: "Components/Card",
  component: Card.Root,
  parameters: { figma: {} },
});

export const Default = meta.story({
  render: () => (
    <Card.Root>
      <Card.Header>
        <Card.Title>Revenue</Card.Title>
        <Card.Description>Last 30 days</Card.Description>
      </Card.Header>
      <Card.Content>$48,200.00 from 36 invoices.</Card.Content>
      <Card.Footer>
        <Button variant="outline" size="sm">
          View report
        </Button>
      </Card.Footer>
    </Card.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 3, name: "Revenue" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "View report" })).toBeVisible();
  },
});

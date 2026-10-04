import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Stat from "./stat";

const meta = preview.meta({ title: "Components/Stat", parameters: { figma: {} } });

/** The direction is spoken as well as drawn, so color and arrows are never the only signal. */
export const Default = meta.story({
  render: () => (
    <Stat.Root>
      <Stat.Label>Revenue</Stat.Label>
      <Stat.Value>$48,200</Stat.Value>
      <Stat.Delta trend="up">12% from last month</Stat.Delta>
    </Stat.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Up:", { exact: false })).toBeInTheDocument();
    await expect(canvas.getByText("$48,200")).toBeVisible();
  },
});

export const Falling = meta.story({
  render: () => (
    <Stat.Root>
      <Stat.Label>Churn</Stat.Label>
      <Stat.Value>3.2%</Stat.Value>
      <Stat.Delta trend="down">0.4 points from last month</Stat.Delta>
    </Stat.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Down:", { exact: false })).toBeInTheDocument();
  },
});

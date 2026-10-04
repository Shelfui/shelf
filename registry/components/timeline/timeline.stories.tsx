import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Timeline from "./timeline";

const meta = preview.meta({ title: "Components/Timeline", parameters: { figma: {} } });

/** A list of events, newest first, each with a machine-readable time. */
export const Default = meta.story({
  render: () => (
    <Timeline.Root aria-label="Release history">
      <Timeline.Item>
        <Timeline.Title>Deployed to production</Timeline.Title>
        <Timeline.Time dateTime="2026-10-03T09:00">Today, 9:00</Timeline.Time>
        <Timeline.Description>Build 412 passed all checks.</Timeline.Description>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Title>Review approved</Timeline.Title>
        <Timeline.Time dateTime="2026-10-02T16:20">Yesterday, 16:20</Timeline.Time>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Title>Pull request opened</Timeline.Title>
        <Timeline.Time dateTime="2026-10-02T11:05">Yesterday, 11:05</Timeline.Time>
      </Timeline.Item>
    </Timeline.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    await expect(canvas.getByText("Today, 9:00")).toHaveAttribute("datetime", "2026-10-03T09:00");
  },
});

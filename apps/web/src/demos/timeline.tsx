import * as Timeline from "@/components/ui/timeline";

export default function TimelineDemo() {
  return (
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
    </Timeline.Root>
  );
}

"use client";

import { TimePicker } from "@/components/ui/time-picker";

export default function TimePickerDemo() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <TimePicker aria-label="Start time" defaultValue="09:30" />
      <TimePicker aria-label="End time" defaultValue="17:00" hour12 />
    </div>
  );
}

"use client";

import { Attachment } from "@/components/ui/attachment";

export default function AttachmentDemo() {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Attachment name="quarterly-report.pdf" onRemove={() => {}} />
      <Attachment name="notes.txt" />
    </div>
  );
}

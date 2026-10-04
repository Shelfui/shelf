"use client";

import { Rating } from "@/components/ui/rating";

export default function RatingDemo() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Rating aria-label="Rate this answer" />
      <Rating aria-label="Average rating" readOnly value={4} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import * as Reasoning from "@/components/ui/reasoning";

export default function ReasoningDemo() {
  const [streaming, setStreaming] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setStreaming(false), 2500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <Reasoning.Root streaming={streaming} seconds={3}>
      <Reasoning.Trigger />
      <Reasoning.Content>
        The user wants the release notes. I should list the three changes in order, newest first.
      </Reasoning.Content>
    </Reasoning.Root>
  );
}

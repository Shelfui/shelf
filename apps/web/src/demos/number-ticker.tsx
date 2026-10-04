"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";

export default function NumberTickerDemo() {
  const [value, setValue] = useState(1200);
  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <NumberTicker value={value} format={{ style: "currency", currency: "USD" }} locale="en-US" />
      <Button onClick={() => setValue(Math.round(Math.random() * 9000))}>Change</Button>
    </div>
  );
}

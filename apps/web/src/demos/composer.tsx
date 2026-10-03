"use client";

import { useState } from "react";
import * as Composer from "@/components/ui/composer";

export default function ComposerDemo() {
  const [sent, setSent] = useState("");
  return (
    <div style={{ width: "100%", maxWidth: "36rem" }}>
      <Composer.Root onSubmit={({ text }) => setSent(text)}>
        <Composer.Files />
        <Composer.Input placeholder="Ask anything" />
        <Composer.Footer>
          <Composer.Attach />
          <Composer.Submit />
        </Composer.Footer>
      </Composer.Root>
      <p>{sent ? `Sent: ${sent}` : null}</p>
    </div>
  );
}

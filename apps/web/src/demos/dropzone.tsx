"use client";

import { useState } from "react";
import * as Dropzone from "@/components/ui/dropzone";

export default function DropzoneDemo() {
  const [names, setNames] = useState<string[]>([]);
  return (
    <div style={{ width: "100%", maxWidth: "26rem" }}>
      <Dropzone.Root
        accept={{ "image/*": [] }}
        maxSize={5_000_000}
        onFiles={(files) => setNames(files.map((f) => f.name))}
      >
        <Dropzone.Area>Drop images here, or press to choose</Dropzone.Area>
        <Dropzone.Overlay />
        <Dropzone.Rejections />
      </Dropzone.Root>
      <p>{names.join(", ")}</p>
    </div>
  );
}

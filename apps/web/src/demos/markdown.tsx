"use client";

import { useEffect, useState } from "react";
import { Markdown } from "@/components/ui/markdown";

const TEXT = `## Streaming markdown

Only the **last block** re-renders, and unfinished syntax such as \`code\` is completed as it arrives.

- Raw HTML shows as text
- Links open safely

\`\`\`ts
export const answer = 42;
\`\`\`
`;

export default function MarkdownDemo() {
  const [length, setLength] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setLength((current) => {
        if (current >= TEXT.length) {
          clearInterval(timer);
          return current;
        }
        return current + 6;
      });
    }, 40);
    return () => clearInterval(timer);
  }, []);
  return <Markdown streaming={length < TEXT.length}>{TEXT.slice(0, length)}</Markdown>;
}

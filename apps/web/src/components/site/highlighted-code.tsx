"use client";

import { useEffect, useState } from "react";
import type { Language } from "@/lib/highlight";
import { CodeFrame, type CodeFrameProps } from "./code-frame";

/** Code that changes on the client. It shows as plain text until Shiki has loaded. */
export function HighlightedCode({
  code,
  lang = "tsx",
  ...props
}: Omit<CodeFrameProps, "html"> & { lang?: Language }) {
  const [result, setResult] = useState<{ code: string; html: string }>();

  useEffect(() => {
    let current = true;
    void import("@/lib/highlight")
      .then(({ highlight }) => highlight(code, lang))
      .then((html) => {
        if (current) setResult({ code, html });
      });
    return () => {
      current = false;
    };
  }, [code, lang]);

  return (
    <CodeFrame code={code} html={result?.code === code ? result.html : undefined} {...props} />
  );
}

import { type Language, highlight } from "@/lib/highlight";
import { CodeFrame, type CodeFrameProps } from "./code-frame";

/** Highlighted code, rendered on the server. */
export async function CodeBlock({
  code,
  lang = "tsx",
  ...props
}: Omit<CodeFrameProps, "html"> & { lang?: Language }) {
  const html = await highlight(code, lang);
  return <CodeFrame code={code} html={html} {...props} />;
}

import { type HighlighterCore, createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

export type Language = "tsx" | "bash" | "css" | "json" | "yaml";

let highlighter: Promise<HighlighterCore> | undefined;

function getHighlighter(): Promise<HighlighterCore> {
  highlighter ??= createHighlighterCore({
    themes: [
      import("shiki/dist/themes/github-light.mjs"),
      import("shiki/dist/themes/github-dark.mjs"),
    ],
    langs: [
      import("shiki/dist/langs/tsx.mjs"),
      import("shiki/dist/langs/bash.mjs"),
      import("shiki/dist/langs/css.mjs"),
      import("shiki/dist/langs/json.mjs"),
      import("shiki/dist/langs/yaml.mjs"),
    ],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

/**
 * HTML with both themes' colors as `--shiki-light` and `--shiki-dark` on each token;
 * `globals.css` picks one from `<body data-mode>`.
 */
export async function highlight(code: string, lang: Language): Promise<string> {
  const instance = await getHighlighter();
  return instance.codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
}

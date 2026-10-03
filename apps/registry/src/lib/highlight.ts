import type { HighlighterCore } from "shiki/core";

export type Language = "tsx" | "css" | "json";

let highlighter: Promise<HighlighterCore> | undefined;

/** Loaded on first use, so the catalog doesn't pay for the highlighter. */
function getHighlighter(): Promise<HighlighterCore> {
  highlighter ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
    ]);
    return createHighlighterCore({
      themes: [
        import("shiki/dist/themes/github-light.mjs"),
        import("shiki/dist/themes/github-dark.mjs"),
      ],
      langs: [
        import("shiki/dist/langs/tsx.mjs"),
        import("shiki/dist/langs/css.mjs"),
        import("shiki/dist/langs/json.mjs"),
      ],
      engine: createJavaScriptRegexEngine(),
    });
  })();
  return highlighter;
}

export function languageOf(file: string): Language {
  if (file.endsWith(".css")) return "css";
  if (file.endsWith(".json")) return "json";
  return "tsx";
}

/** Both themes' colors as `--shiki-light` and `--shiki-dark`; index.css picks one. */
export async function highlight(code: string, lang: Language): Promise<string> {
  const instance = await getHighlighter();
  return instance.codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
}

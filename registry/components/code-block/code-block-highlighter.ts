import type { HighlighterCore, LanguageInput, ThemedToken } from "shiki/core";

/**
 * Syntax highlighting with Shiki, loaded only when a code block needs it.
 *
 * - `shiki/core` and the JavaScript regex engine: no WASM, no bundled grammars.
 * - One CSS-variables theme, so light and dark share a single tokenization; `code-block.tsx`
 *   maps the variables to Shelf colors.
 * - Each language is its own chunk, loaded the first time it appears.
 *
 * Every dynamic `import()` below has a literal specifier so bundlers can split it.
 */

export type Tokens = ThemedToken[][];

const GRAMMARS: Record<string, () => Promise<{ default: LanguageInput }>> = {
  bash: () => import("shiki/langs/bash.mjs"),
  c: () => import("shiki/langs/c.mjs"),
  cpp: () => import("shiki/langs/cpp.mjs"),
  csharp: () => import("shiki/langs/csharp.mjs"),
  css: () => import("shiki/langs/css.mjs"),
  diff: () => import("shiki/langs/diff.mjs"),
  go: () => import("shiki/langs/go.mjs"),
  html: () => import("shiki/langs/html.mjs"),
  java: () => import("shiki/langs/java.mjs"),
  javascript: () => import("shiki/langs/javascript.mjs"),
  json: () => import("shiki/langs/json.mjs"),
  jsx: () => import("shiki/langs/jsx.mjs"),
  markdown: () => import("shiki/langs/markdown.mjs"),
  python: () => import("shiki/langs/python.mjs"),
  ruby: () => import("shiki/langs/ruby.mjs"),
  rust: () => import("shiki/langs/rust.mjs"),
  sql: () => import("shiki/langs/sql.mjs"),
  swift: () => import("shiki/langs/swift.mjs"),
  toml: () => import("shiki/langs/toml.mjs"),
  tsx: () => import("shiki/langs/tsx.mjs"),
  typescript: () => import("shiki/langs/typescript.mjs"),
  yaml: () => import("shiki/langs/yaml.mjs"),
};

const ALIASES: Record<string, string> = {
  "c++": "cpp",
  "c#": "csharp",
  cs: "csharp",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  mts: "typescript",
  py: "python",
  rb: "ruby",
  rs: "rust",
  sh: "bash",
  shell: "bash",
  shellscript: "bash",
  zsh: "bash",
  console: "bash",
  yml: "yaml",
  md: "markdown",
  patch: "diff",
  jsonc: "json",
  json5: "json",
  htm: "html",
  xml: "html",
  svg: "html",
};

/** The grammar name for a fence's language tag, or `undefined` when there is none to load. */
export function resolveLanguage(tag: string | undefined): string | undefined {
  if (!tag) return undefined;
  const name = tag.trim().toLowerCase();
  const resolved = ALIASES[name] ?? name;
  return resolved in GRAMMARS ? resolved : undefined;
}

const THEME = "shelf";
/** Prefix of the CSS variables the theme writes; `code-block.tsx` defines them. */
export const VARIABLE_PREFIX = "--sx-";

let core: Promise<HighlighterCore> | undefined;
const grammars = new Map<string, Promise<void>>();

/** Loads Shiki's core, engine, and theme in one chunk. Safe to call any number of times. */
export function preloadHighlighter(): Promise<HighlighterCore> {
  core ??= loadCore().catch((error: unknown) => {
    // Let the next call retry instead of caching a failure.
    core = undefined;
    throw error;
  });
  return core;
}

async function loadCore(): Promise<HighlighterCore> {
  const [{ createHighlighterCore, createCssVariablesTheme }, { createJavaScriptRegexEngine }] =
    await Promise.all([import("shiki/core"), import("shiki/engine/javascript")]);
  const theme = createCssVariablesTheme({
    name: THEME,
    variablePrefix: VARIABLE_PREFIX,
    fontStyle: true,
  });
  return createHighlighterCore({
    themes: [theme],
    langs: [],
    // Pinned: the automatic ES2025 target mis-tokenizes `1; // hi` in some engines.
    engine: createJavaScriptRegexEngine({ target: "ES2018" }),
  });
}

/** Loads one language's grammar. Resolves to `false` for an unknown language. */
export async function preloadLanguage(tag: string | undefined): Promise<boolean> {
  const language = resolveLanguage(tag);
  if (!language) return false;
  const highlighter = await preloadHighlighter();
  let pending = grammars.get(language);
  if (!pending) {
    const grammar = GRAMMARS[language];
    if (!grammar) return false;
    pending = grammar()
      .then((module) => highlighter.loadLanguage(module.default))
      .catch((error: unknown) => {
        grammars.delete(language);
        throw error;
      });
    grammars.set(language, pending);
  }
  await pending;
  return true;
}

const warm = () => void preloadHighlighter().catch(() => {});

/** Warms the highlighter when the browser is idle. */
export function preloadHighlighterWhenIdle(): void {
  if (typeof window === "undefined") return;
  if ("requestIdleCallback" in window) window.requestIdleCallback(warm, { timeout: 4000 });
  else setTimeout(warm, 1500);
}

const CACHE_LIMIT = 200;
const cache = new Map<string, Tokens>();

const keyOf = (code: string, language: string) => `${language}\u0000${code}`;

/** Tokens already computed for this code, so a remounted block paints highlighted at once. */
export function peekTokens(code: string, tag: string | undefined): Tokens | undefined {
  const language = resolveLanguage(tag);
  return language ? cache.get(keyOf(code, language)) : undefined;
}

/**
 * Highlights `code`. Resolves to `undefined` for an unknown language. Rejects if a chunk fails
 * to load, so the caller can keep showing plain text.
 */
export async function highlight(
  code: string,
  tag: string | undefined,
): Promise<Tokens | undefined> {
  const language = resolveLanguage(tag);
  if (!language) return undefined;
  const key = keyOf(code, language);
  const hit = cache.get(key);
  if (hit) return hit;

  if (!(await preloadLanguage(language))) return undefined;
  const highlighter = await preloadHighlighter();
  const { tokens } = highlighter.codeToTokens(code, { lang: language, theme: THEME });

  cache.set(key, tokens);
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  return tokens;
}

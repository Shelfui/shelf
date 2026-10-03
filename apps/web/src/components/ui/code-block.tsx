"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, Fragment, useEffect, useRef, useState } from "react";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";
import { Button } from "./button";
import { CheckIcon, CopyIcon } from "./icons";
import {
  highlight,
  peekTokens,
  preloadHighlighterWhenIdle,
  type Tokens,
} from "./code-block-highlighter";

export { preloadHighlighter, preloadLanguage } from "./code-block-highlighter";

/** Above this, the block stays plain text: tokenizing a huge paste would block the main thread. */
const MAX_HIGHLIGHT_LENGTH = 30_000;

export interface CodeBlockProps extends Styled<Omit<ComponentProps<"div">, "children">> {
  code: string;
  /** The fence's language tag, such as `ts` or `python`. Unknown languages stay plain. */
  language?: string;
  /**
   * The fence is still open and `code` is still growing. The block stays plain text, with no copy
   * button, until it closes, so nothing re-tokenizes on every token.
   */
  streaming?: boolean;
}

/**
 * A code listing with a language label and a copy button. Highlighting loads on demand and the
 * block is readable immediately: plain text first, colored when the grammar arrives. If the
 * highlighter fails to load, the plain text stays.
 *
 *   <CodeBlock language="ts" code={source} />
 */
export function CodeBlock({ code, language, streaming = false, style, ...props }: CodeBlockProps) {
  const tokens = useTokens(code, language, streaming);
  return (
    <div
      data-slot="code-block"
      data-streaming={streaming || undefined}
      {...props}
      {...stylex.props(styles.root, style)}
    >
      <div {...stylex.props(styles.header)}>
        <span {...stylex.props(styles.language)}>{language || "text"}</span>
        {streaming ? null : <CopyButton code={code} />}
      </div>
      {/* Scrollable regions must be focusable so keyboard users can scroll them. */}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <pre
        tabIndex={0}
        aria-label={language ? `${language} code` : "Code"}
        {...stylex.props(styles.pre)}
      >
        <code>{tokens ? <Colored tokens={tokens} /> : code}</code>
      </pre>
    </div>
  );
}

function useTokens(code: string, language: string | undefined, streaming: boolean) {
  const eligible = !streaming && !!language && code.length <= MAX_HIGHLIGHT_LENGTH;
  const [result, setResult] = useState<{ code: string; language?: string; tokens: Tokens }>();

  useEffect(() => {
    if (!eligible) return undefined;
    preloadHighlighterWhenIdle();
    let current = true;
    highlight(code, language)
      .then((tokens) => {
        if (current && tokens) setResult({ code, language, tokens });
      })
      .catch(() => {
        // The plain text is already on screen.
      });
    return () => {
      current = false;
    };
  }, [eligible, code, language]);

  if (!eligible) return undefined;
  if (result && result.code === code && result.language === language) return result.tokens;
  // A block that remounts with code already highlighted paints colored on the first frame.
  return peekTokens(code, language);
}

function Colored({ tokens }: { tokens: Tokens }) {
  return tokens.map((line, row) => (
    // oxlint-disable-next-line react/no-array-index-key -- lines have no identity; the list is rebuilt, never reordered
    <Fragment key={row}>
      {row > 0 ? "\n" : null}
      {line.map((token, column) => {
        const style = tokenStyle(token.color);
        // oxlint-disable-next-line react/no-array-index-key
        return style ? (
          <span key={column} {...stylex.props(style)}>
            {token.content}
          </span>
        ) : (
          token.content
        );
      })}
    </Fragment>
  ));
}

/** Shiki writes `var(--sx-token-keyword)`; the matching StyleX style carries the real color. */
function tokenStyle(color: string | undefined) {
  if (!color) return undefined;
  const name = /^var\(--sx-(.+)\)$/.exec(color)?.[1];
  return name ? tokens[name] : undefined;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = () => {
    navigator.clipboard.writeText(code).then(
      () => {
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1500);
      },
      () => {},
    );
  };

  return (
    <Button variant="ghost" size="xs" onClick={copy} aria-label={copied ? "Copied" : "Copy code"}>
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

const styles = stylex.create({
  root: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: colors.card,
    color: colors.cardForeground,
    // Grammar colors adapt to the page's color scheme; see `applyTheme`.
    colorScheme: "light dark",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  header: {
    paddingBlock: spacing["1"],
    paddingInline: spacing["3"],
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    minHeight: spacing["6"],
  },
  language: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeightXs,
  },
  pre: {
    margin: 0,
    padding: spacing["3"],
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    outlineOffset: -2,
    tabSize: 2,
    whiteSpace: "pre",
    overflowX: "auto",
  },
});

// Contrast: every color is at least 4.5:1 against `card` in both schemes.
const tokenColors = stylex.create({
  keyword: { color: "light-dark(#a3156b, #ff7ab2)" },
  string: { color: "light-dark(#0b6b36, #8fd88f)" },
  constant: { color: "light-dark(#1750b8, #82b4ff)" },
  function: { color: "light-dark(#6b3fb5, #c9a7ff)" },
  comment: { color: "light-dark(#666666, #9a9a9a)", fontStyle: "italic" },
  parameter: { color: "light-dark(#8a4b00, #ffb86b)" },
  punctuation: { color: "light-dark(#4d4d4d, #b8b8b8)" },
  link: { textDecoration: "underline", color: "light-dark(#1750b8, #82b4ff)" },
});

const tokens: Record<string, (typeof tokenColors)[keyof typeof tokenColors] | undefined> = {
  "token-keyword": tokenColors.keyword,
  "token-string": tokenColors.string,
  "token-string-expression": tokenColors.string,
  "token-constant": tokenColors.constant,
  "token-function": tokenColors.function,
  "token-comment": tokenColors.comment,
  "token-parameter": tokenColors.parameter,
  "token-punctuation": tokenColors.punctuation,
  "token-link": tokenColors.link,
};

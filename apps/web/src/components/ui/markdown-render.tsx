import * as stylex from "@stylexjs/stylex";
import { marked, type MarkedToken, type Token } from "marked";
import { Fragment, type ReactNode } from "react";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { CodeBlock } from "./code-block";
import { endsInsideFence } from "./markdown-blocks";
import { isAllowedImage, safeUrl } from "./markdown-url";

export interface RenderOptions {
  /** Image origins that may load, such as `["https://cdn.example.com"]`. Others show their alt text. */
  imageOrigins: readonly string[];
  /** The block is the last one and still growing. */
  streaming: boolean;
}

/** Renders one block of markdown. Raw HTML is shown as text, never parsed. */
export function renderBlock(source: string, options: RenderOptions): ReactNode {
  return blocks(marked.lexer(source, { gfm: true }), options);
}

// marked only emits the types in `MarkedToken` unless extensions are registered, and none are.
function isKnown(token: Token): token is MarkedToken {
  return typeof token.type === "string";
}

function known(token: Token): MarkedToken {
  return isKnown(token) ? token : { type: "text", raw: token.raw, text: token.raw };
}

const HEADINGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

function blocks(tokens: Token[], options: RenderOptions): ReactNode {
  return tokens.map((token, i) => {
    const node = block(token, options);
    // Tokens are parsed from text and never reorder, so the position is their identity.
    // react-doctor-disable-next-line react-doctor/no-array-index-as-key
    return node === null ? null : <Fragment key={i}>{node}</Fragment>;
  });
}

function block(input: Token, options: RenderOptions): ReactNode {
  const token = known(input);
  switch (token.type) {
    case "space":
    case "def":
      return null;
    case "paragraph":
      return <p {...stylex.props(styles.p)}>{inline(token.tokens, options)}</p>;
    case "text": {
      const { tokens, text } = token;
      return tokens ? inline(tokens, options) : text;
    }
    case "heading": {
      const { depth, tokens } = token;
      const Tag = HEADINGS[Math.min(Math.max(depth, 1), 6) - 1] ?? "h6";
      return (
        <Tag
          {...stylex.props(styles.heading, depth <= 2 ? styles.headingLarge : styles.headingSmall)}
        >
          {inline(tokens, options)}
        </Tag>
      );
    }
    case "code": {
      const { text, lang, raw } = token;
      return (
        <CodeBlock
          code={text}
          language={lang?.split(/\s/)[0] || undefined}
          streaming={options.streaming && endsInsideFence(raw)}
        />
      );
    }
    case "blockquote":
      return (
        <blockquote {...stylex.props(styles.quote)}>
          {blocks(token.tokens, { ...options, streaming: false })}
        </blockquote>
      );
    case "list": {
      const list = token;
      const Tag = list.ordered ? "ol" : "ul";
      return (
        <Tag
          start={list.ordered && list.start !== 1 ? list.start || undefined : undefined}
          {...stylex.props(styles.list, list.ordered ? styles.ordered : styles.unordered)}
        >
          {list.items.map((item, i) => (
            // react-doctor-disable-next-line react-doctor/no-array-index-as-key
            <li key={i} {...stylex.props(styles.item)}>
              {item.task ? (
                <input
                  type="checkbox"
                  checked={!!item.checked}
                  disabled
                  readOnly
                  aria-label={item.checked ? "Done" : "Not done"}
                  {...stylex.props(styles.checkbox)}
                />
              ) : null}
              {blocks(
                item.tokens.filter((t) => t.type !== "checkbox"),
                { ...options, streaming: false },
              )}
            </li>
          ))}
        </Tag>
      );
    }
    case "table": {
      const table = token;
      return (
        // A scrollable region must be focusable for keyboard users.
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        <div tabIndex={0} role="region" aria-label="Table" {...stylex.props(styles.tableWrap)}>
          <table {...stylex.props(styles.table)}>
            <thead>
              <tr>
                {table.header.map((cell, i) => (
                  // react-doctor-disable-next-line react-doctor/no-array-index-as-key
                  <th key={i} scope="col" {...stylex.props(styles.th, align(cell.align))}>
                    {inline(cell.tokens, options)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} {...stylex.props(styles.td, align(cell.align))}>
                      {inline(cell.tokens, options)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "hr":
      return <hr {...stylex.props(styles.hr)} />;
    default:
      // Raw HTML and anything unknown: visible text, never markup.
      return <p {...stylex.props(styles.p)}>{token.raw}</p>;
  }
}

// Column alignment comes from the table syntax, so it is data, not design.
const align = (value: "left" | "right" | "center" | null) =>
  value === "right" ? styles.right : value === "center" ? styles.center : undefined;

function inline(tokens: Token[] | undefined, options: RenderOptions): ReactNode {
  if (!tokens) return null;
  return tokens.map((token, i) => (
    // react-doctor-disable-next-line react-doctor/no-array-index-as-key
    <Fragment key={i}>{inlineToken(token, options)}</Fragment>
  ));
}

function inlineToken(input: Token, options: RenderOptions): ReactNode {
  const token = known(input);
  switch (token.type) {
    case "text": {
      const { tokens, text } = token;
      return tokens ? inline(tokens, options) : text;
    }
    case "escape":
      return token.text;
    case "strong":
      return <strong {...stylex.props(styles.strong)}>{inline(token.tokens, options)}</strong>;
    case "em":
      return <em>{inline(token.tokens, options)}</em>;
    case "del":
      return <del>{inline(token.tokens, options)}</del>;
    case "codespan":
      return <code {...stylex.props(styles.codespan)}>{token.text}</code>;
    case "br":
      return <br />;
    case "link": {
      const link = token;
      const href = safeUrl(link.href);
      const children = inline(link.tokens, options);
      if (!href) return children;
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          {...stylex.props(styles.link)}
        >
          {children}
        </a>
      );
    }
    case "image": {
      const image = token;
      if (!isAllowedImage(image.href, options.imageOrigins)) {
        return <span {...stylex.props(styles.blocked)}>{image.text}</span>;
      }
      return (
        <img
          src={image.href}
          alt={image.text}
          loading="lazy"
          referrerPolicy="no-referrer"
          {...stylex.props(styles.image)}
        />
      );
    }
    default:
      return token.raw;
  }
}

const styles = stylex.create({
  right: { textAlign: "right" },
  center: { textAlign: "center" },
  p: { margin: 0 },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontWeight: typography.fontWeightSemibold,
  },
  headingLarge: { fontSize: typography.fontSizeLg, lineHeight: typography.lineHeightLg },
  headingSmall: { fontSize: typography.fontSizeBase, lineHeight: typography.lineHeightBase },
  strong: { fontWeight: typography.fontWeightSemibold },
  quote: {
    margin: 0,
    gap: spacing["2"],
    borderInlineStartColor: colors.border,
    borderInlineStartStyle: "solid",
    borderInlineStartWidth: 2,
    color: colors.mutedForeground,
    display: "flex",
    flexDirection: "column",
    paddingInlineStart: spacing["3"],
  },
  list: {
    margin: 0,
    gap: spacing["1"],
    display: "flex",
    flexDirection: "column",
    paddingInlineStart: spacing["4"],
  },
  unordered: { listStyleType: "disc" },
  ordered: { listStyleType: "decimal" },
  item: {
    display: "list-item",
    paddingInlineStart: spacing["1"],
  },
  checkbox: { marginInlineEnd: spacing["2"], verticalAlign: "middle" },
  codespan: {
    borderRadius: radius.sm,
    paddingBlock: 1,
    paddingInline: spacing["1.5"],
    backgroundColor: colors.muted,
    fontFamily: typography.fontFamilyMono,
    fontSize: "0.9em",
  },
  link: {
    color: colors.foreground,
    textDecorationColor: { default: colors.ring, ":hover": colors.foreground },
    textDecorationLine: "underline",
    textUnderlineOffset: "0.2em",
  },
  image: { borderRadius: radius.md, height: "auto", maxWidth: "100%" },
  blocked: { color: colors.mutedForeground },
  hr: {
    margin: 0,
    borderWidth: 0,
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
    width: "100%",
  },
  tableWrap: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    outlineColor: colors.ring,
    outlineOffset: -2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    maxWidth: "100%",
    overflowX: "auto",
  },
  table: {
    borderCollapse: "collapse",
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    width: "100%",
  },
  th: {
    paddingBlock: spacing["1.5"],
    paddingInline: spacing["3"],
    backgroundColor: colors.muted,
    fontWeight: typography.fontWeightMedium,
    textAlign: "start",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  td: {
    paddingBlock: spacing["1.5"],
    paddingInline: spacing["3"],
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
});

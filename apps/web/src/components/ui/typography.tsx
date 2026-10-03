import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";

/**
 * Styles for prose, one small component per element:
 *
 *   <Typography.H1>Billing</Typography.H1>
 *   <Typography.Lead>Plans, invoices, and payment methods.</Typography.Lead>
 *   <Typography.P>Invoices are sent on the <Typography.InlineCode>1st</Typography.InlineCode>.</Typography.P>
 *
 * Each renders its natural element, so pick by meaning: `H2` is an `<h2>`. Headings and
 * paragraphs carry their own spacing, so consecutive blocks read without extra layout.
 */
export function H1({ style, ...props }: Styled<ComponentProps<"h1">>) {
  return (
    <h1 data-slot="typography-h1" {...props} {...stylex.props(styles.base, styles.h1, style)} />
  );
}

export function H2({ style, ...props }: Styled<ComponentProps<"h2">>) {
  return (
    <h2 data-slot="typography-h2" {...props} {...stylex.props(styles.base, styles.h2, style)} />
  );
}

export function H3({ style, ...props }: Styled<ComponentProps<"h3">>) {
  return (
    <h3 data-slot="typography-h3" {...props} {...stylex.props(styles.base, styles.h3, style)} />
  );
}

export function H4({ style, ...props }: Styled<ComponentProps<"h4">>) {
  return (
    <h4 data-slot="typography-h4" {...props} {...stylex.props(styles.base, styles.h4, style)} />
  );
}

export function P({ style, ...props }: Styled<ComponentProps<"p">>) {
  return <p data-slot="typography-p" {...props} {...stylex.props(styles.base, styles.p, style)} />;
}

/** An introductory paragraph under a page title. */
export function Lead({ style, ...props }: Styled<ComponentProps<"p">>) {
  return (
    <p data-slot="typography-lead" {...props} {...stylex.props(styles.base, styles.lead, style)} />
  );
}

export function Large({ style, ...props }: Styled<ComponentProps<"div">>) {
  return (
    <div
      data-slot="typography-large"
      {...props}
      {...stylex.props(styles.base, styles.large, style)}
    />
  );
}

export function Small({ style, ...props }: Styled<ComponentProps<"small">>) {
  return (
    <small
      data-slot="typography-small"
      {...props}
      {...stylex.props(styles.base, styles.small, style)}
    />
  );
}

export function Muted({ style, ...props }: Styled<ComponentProps<"p">>) {
  return (
    <p
      data-slot="typography-muted"
      {...props}
      {...stylex.props(styles.base, styles.muted, style)}
    />
  );
}

export function Blockquote({ style, ...props }: Styled<ComponentProps<"blockquote">>) {
  return (
    <blockquote
      data-slot="typography-blockquote"
      {...props}
      {...stylex.props(styles.base, styles.blockquote, style)}
    />
  );
}

/** A bulleted `<ul>`. Pass plain `<li>` children. */
export function List({ style, ...props }: Styled<ComponentProps<"ul">>) {
  return (
    <ul data-slot="typography-list" {...props} {...stylex.props(styles.base, styles.list, style)} />
  );
}

export function InlineCode({ style, ...props }: Styled<ComponentProps<"code">>) {
  return (
    <code
      data-slot="typography-inline-code"
      {...props}
      {...stylex.props(styles.base, styles.inlineCode, style)}
    />
  );
}

const styles = stylex.create({
  base: {
    fontSynthesis: "none",
    margin: 0,
    color: colors.foreground,
    fontFamily: typography.fontFamily,
  },
  h1: {
    fontSize: "2.25rem",
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: "-0.025em",
    lineHeight: "2.5rem",
    textWrap: "balance",
  },
  h2: {
    fontSize: "1.875rem",
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: "-0.025em",
    lineHeight: "2.25rem",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    marginTop: {
      default: "2.5rem",
      ":first-child": 0,
    },
    paddingBottom: spacing["2"],
  },
  h3: {
    fontSize: "1.5rem",
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: "-0.025em",
    lineHeight: "2rem",
    marginTop: {
      default: "2rem",
      ":first-child": 0,
    },
  },
  h4: {
    fontSize: "1.25rem",
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: "-0.025em",
    lineHeight: "1.75rem",
    marginTop: {
      default: spacing["6"],
      ":first-child": 0,
    },
  },
  p: {
    fontSize: typography.fontSizeBase,
    lineHeight: "1.75rem",
    marginTop: {
      default: spacing["6"],
      ":first-child": 0,
    },
  },
  lead: {
    color: colors.mutedForeground,
    fontSize: "1.25rem",
    lineHeight: "1.75rem",
    marginTop: {
      default: spacing["2"],
      ":first-child": 0,
    },
  },
  large: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    lineHeight: typography.lineHeightLg,
  },
  small: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    lineHeight: 1,
  },
  muted: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  blockquote: {
    borderInlineStartColor: colors.border,
    borderInlineStartStyle: "solid",
    borderInlineStartWidth: 2,
    fontSize: typography.fontSizeBase,
    fontStyle: "italic",
    lineHeight: "1.75rem",
    paddingInlineStart: spacing["6"],
    marginTop: spacing["6"],
  },
  list: {
    marginBlock: spacing["6"],
    fontSize: typography.fontSizeBase,
    lineHeight: "1.75rem",
    listStyleType: "disc",
    paddingInlineStart: spacing["6"],
  },
  inlineCode: {
    borderRadius: radius.sm,
    paddingBlock: "0.2em",
    paddingInline: "0.3em",
    backgroundColor: colors.muted,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
  },
});

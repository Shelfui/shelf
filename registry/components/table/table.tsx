import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors, spacing, typography } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";

/**
 * A semantic HTML table with Shelf styles. Wide tables scroll horizontally inside `Root`.
 *
 *   <Table.Root>
 *     <Table.Caption>Recent invoices</Table.Caption>
 *     <Table.Header>
 *       <Table.Row><Table.Head>Customer</Table.Head><Table.Head>Amount</Table.Head></Table.Row>
 *     </Table.Header>
 *     <Table.Body>
 *       <Table.Row><Table.Cell>Acme Inc.</Table.Cell><Table.Cell>$1,200.00</Table.Cell></Table.Row>
 *     </Table.Body>
 *   </Table.Root>
 */
export function Root({ style, ...props }: Styled<ComponentProps<"table">>) {
  return (
    <div data-slot="table-container" {...stylex.props(styles.container)}>
      <table data-slot="table" {...props} {...stylex.props(styles.table, style)} />
    </div>
  );
}

export function Header({ style, ...props }: Styled<ComponentProps<"thead">>) {
  return <thead data-slot="table-header" {...props} {...stylex.props(style)} />;
}

export function Body({ style, ...props }: Styled<ComponentProps<"tbody">>) {
  return <tbody data-slot="table-body" {...props} {...stylex.props(style)} />;
}

export function Footer({ style, ...props }: Styled<ComponentProps<"tfoot">>) {
  return <tfoot data-slot="table-footer" {...props} {...stylex.props(styles.footer, style)} />;
}

export function Row({ style, ...props }: Styled<ComponentProps<"tr">>) {
  return <tr data-slot="table-row" {...props} {...stylex.props(styles.row, style)} />;
}

export function Head({ style, ...props }: Styled<ComponentProps<"th">>) {
  return <th data-slot="table-head" {...props} {...stylex.props(styles.head, style)} />;
}

export function Cell({ style, ...props }: Styled<ComponentProps<"td">>) {
  return <td data-slot="table-cell" {...props} {...stylex.props(styles.cell, style)} />;
}

export function Caption({ style, ...props }: Styled<ComponentProps<"caption">>) {
  return <caption data-slot="table-caption" {...props} {...stylex.props(styles.caption, style)} />;
}

const styles = stylex.create({
  container: {
    position: "relative",
    overflowX: "auto",
    width: "100%",
  },
  table: {
    fontSynthesis: "none",
    borderCollapse: "collapse",
    captionSide: "bottom",
    color: colors.foreground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    width: "100%",
  },
  footer: {
    fontWeight: typography.fontWeightMedium,
  },
  row: {
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  head: {
    paddingInline: spacing["2"],
    color: colors.mutedForeground,
    fontWeight: typography.fontWeightMedium,
    textAlign: "start",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    height: "2.5rem",
  },
  cell: {
    padding: spacing["2"],
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  caption: {
    color: colors.mutedForeground,
    marginTop: spacing["4"],
  },
});

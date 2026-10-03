import * as stylex from "@stylexjs/stylex";
import * as Typography from "@/components/ui/typography";

export default function TypographyDemo() {
  return (
    <article {...stylex.props(styles.root)}>
      <Typography.H1>Closing the books</Typography.H1>
      <Typography.Lead>A short guide to month-end for small finance teams.</Typography.Lead>
      <Typography.P>
        Month-end starts with reconciling every account against its statement. Export the ledger
        with <Typography.InlineCode>shelf export --month</Typography.InlineCode> and compare
        balances line by line.
      </Typography.P>
      <Typography.H2>Before you start</Typography.H2>
      <Typography.List>
        <li>Bank and card statements</li>
        <li>Unpaid invoices and bills</li>
        <li>Receipts for expenses over $75.00</li>
      </Typography.List>
      <Typography.Blockquote>
        "A close that takes three days is a close you can repeat every month."
      </Typography.Blockquote>
      <Typography.Muted>Updated on the first business day of each month.</Typography.Muted>
    </article>
  );
}

const styles = stylex.create({
  root: { maxWidth: "40rem", width: "100%" },
});

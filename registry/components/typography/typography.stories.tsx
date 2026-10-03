import * as stylex from "@stylexjs/stylex";
import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Typography from "./typography";

const meta = preview.meta({
  title: "Components/Typography",
  parameters: { figma: {} },
});

function Article() {
  return (
    <article {...stylex.props(styles.article)}>
      <Typography.H1>Closing the books</Typography.H1>
      <Typography.Lead>A short guide to month-end for small finance teams.</Typography.Lead>
      <Typography.P>
        Month-end starts with reconciling every account against its bank statement. Export the
        ledger with <Typography.InlineCode>shelf export --month</Typography.InlineCode> and compare
        balances line by line.
      </Typography.P>
      <Typography.H2>Before you start</Typography.H2>
      <Typography.P>Collect everything you need in one place:</Typography.P>
      <Typography.List>
        <li>Bank and card statements</li>
        <li>Unpaid invoices and bills</li>
        <li>Receipts for expenses over $75.00</li>
      </Typography.List>
      <Typography.Blockquote>
        "A close that takes three days is a close you can repeat every month."
      </Typography.Blockquote>
      <Typography.H3>Reconciling</Typography.H3>
      <Typography.P>Match transactions first, then investigate what is left.</Typography.P>
      <Typography.H4>Unmatched items</Typography.H4>
      <Typography.Muted>Anything unmatched after a week goes to your accountant.</Typography.Muted>
    </article>
  );
}

/** Each part renders its semantic element, so the outline is right for assistive technology. */
export const Default = meta.story({
  render: () => <Article />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1 })).toHaveTextContent("Closing the books");
    await expect(canvas.getByRole("heading", { level: 2 })).toHaveTextContent("Before you start");
    await expect(canvas.getByRole("heading", { level: 3 })).toHaveTextContent("Reconciling");
    await expect(canvas.getByRole("heading", { level: 4 })).toHaveTextContent("Unmatched items");
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    await expect(canvas.getByText("shelf export --month").tagName).toBe("CODE");
  },
});

/** Headings step down in size, and muted text is quieter than body text. */
export const Scale = meta.story({
  render: () => (
    <div {...stylex.props(styles.article)}>
      <Typography.Large>Large</Typography.Large>
      <Typography.P>Body</Typography.P>
      <Typography.Small>Small</Typography.Small>
      <Typography.Muted>Muted</Typography.Muted>
    </div>
  ),
  play: async ({ canvas }) => {
    const size = (text: string) =>
      Number.parseFloat(getComputedStyle(canvas.getByText(text)).fontSize);

    await expect(size("Large")).toBeGreaterThan(size("Body"));
    await expect(size("Body")).toBeGreaterThan(size("Small"));
    await expect(getComputedStyle(canvas.getByText("Muted")).color).not.toBe(
      getComputedStyle(canvas.getByText("Body")).color,
    );
  },
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <Article />,
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByRole("heading", { level: 1 })).color).toBe(
      "rgb(237, 237, 237)",
    );
  },
});

const styles = stylex.create({
  article: {
    maxWidth: "40rem",
  },
});

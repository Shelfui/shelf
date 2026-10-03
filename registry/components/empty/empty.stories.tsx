import * as stylex from "@stylexjs/stylex";
import { expect, fn, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { colors } from "../../foundations/tokens.stylex";
import { Button } from "../button/button";
import { SearchIcon } from "../icons/icons";
import * as Empty from "./empty";

const meta = preview.meta({
  title: "Components/Empty",
  component: Empty.Root,
  parameters: { figma: {} },
});

const created = fn();

function NoInvoices() {
  return (
    <Empty.Root style={styles.bordered}>
      <Empty.Header>
        <Empty.Media variant="icon">
          <SearchIcon />
        </Empty.Media>
        <Empty.Title>No invoices yet</Empty.Title>
        <Empty.Description>
          Invoices you send appear here, with their payment status.
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button onClick={created}>Create invoice</Button>
      </Empty.Content>
    </Empty.Root>
  );
}

/** The title is a heading, and the action is a real button. */
export const Default = meta.story({
  render: () => <NoInvoices />,
  play: async ({ canvas }) => {
    created.mockClear();

    await expect(canvas.getByRole("heading", { level: 3, name: "No invoices yet" })).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Create invoice" }));

    await expect(created).toHaveBeenCalledTimes(1);
  },
});

/** Without media or actions, it is just a centered message. */
export const TextOnly = meta.story({
  render: () => (
    <Empty.Root>
      <Empty.Header>
        <Empty.Title>No results</Empty.Title>
        <Empty.Description>Try a different search or clear the filters.</Empty.Description>
      </Empty.Header>
    </Empty.Root>
  ),
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByText("No results")).textAlign).toBe("center");
  },
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <NoInvoices />,
  play: async ({ canvas }) => {
    const media = canvas.getByRole("heading").previousElementSibling!;

    await expect(getComputedStyle(media).backgroundColor).toBe("rgb(26, 26, 26)");
    await expect(getComputedStyle(canvas.getByText(/appear here/)).color).toBe(
      "rgb(161, 161, 161)",
    );
  },
});

const styles = stylex.create({
  bordered: {
    borderColor: colors.border,
    borderStyle: "dashed",
    borderWidth: 1,
    maxWidth: "32rem",
  },
});

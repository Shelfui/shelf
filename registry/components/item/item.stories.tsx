import * as stylex from "@stylexjs/stylex";
import { expect, fn, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { Button } from "../button/button";
import { CalendarIcon, ChevronRightIcon, CircleCheckIcon } from "../icons/icons";
import * as Item from "./item";

const meta = preview.meta({
  title: "Components/Item",
  component: Item.Root,
  parameters: { figma: {} },
});

const edited = fn();

function Meetings() {
  return (
    <Item.Group style={styles.list}>
      <Item.Root variant="outline">
        <Item.Media variant="icon">
          <CalendarIcon />
        </Item.Media>
        <Item.Content>
          <Item.Title>Weekly sync</Item.Title>
          <Item.Description>Mondays at 10:00 with the design team.</Item.Description>
        </Item.Content>
        <Item.Actions>
          <Button size="sm" variant="outline" onClick={edited}>
            Edit
          </Button>
        </Item.Actions>
      </Item.Root>
      <Item.Separator />
      <Item.Root variant="muted" size="sm">
        <Item.Media>
          <CircleCheckIcon />
        </Item.Media>
        <Item.Content>
          <Item.Title>Your profile is verified</Item.Title>
        </Item.Content>
      </Item.Root>
    </Item.Group>
  );
}

/** Media, text, and actions sit in one row; actions stay usable. */
export const Default = meta.story({
  render: () => <Meetings />,
  play: async ({ canvas }) => {
    edited.mockClear();

    await expect(canvas.getByText("Weekly sync")).toBeVisible();
    await expect(canvas.getByRole("separator")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Edit" }));

    await expect(edited).toHaveBeenCalledTimes(1);
  },
});

/** Rendered as a link, the whole row is one focusable target that keeps the item styles. */
export const AsLink = meta.story({
  render: () => (
    <Item.Root variant="outline" render={<a href="#billing" />} style={styles.list}>
      <Item.Content>
        <Item.Title>Billing</Item.Title>
        <Item.Description>Plans, invoices, and payment methods.</Item.Description>
      </Item.Content>
      <Item.Actions>
        <ChevronRightIcon />
      </Item.Actions>
    </Item.Root>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: /Billing/ });

    await expect(link).toHaveAttribute("href", "#billing");
    await expect(link).toHaveAttribute("data-slot", "item");

    await userEvent.tab();

    await expect(link).toHaveFocus();
    await expect(getComputedStyle(link).cursor).toBe("pointer");
  },
});

/** Long descriptions clamp to two lines instead of pushing the row taller. */
export const LongDescription = meta.story({
  render: () => (
    <Item.Root variant="outline" style={styles.narrow}>
      <Item.Content>
        <Item.Title>Quarterly report</Item.Title>
        <Item.Description>
          Revenue grew in every region this quarter, led by new customers in Europe, while churn
          held steady and support response times improved across all plans and channels.
        </Item.Description>
      </Item.Content>
    </Item.Root>
  ),
  play: async ({ canvas }) => {
    const description = canvas.getByText(/Revenue grew/);
    const lineHeight = Number.parseFloat(getComputedStyle(description).lineHeight);

    await expect(description.getBoundingClientRect().height).toBeLessThanOrEqual(
      lineHeight * 2 + 1,
    );
  },
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <Meetings />,
  play: async ({ canvas }) => {
    const row = canvas.getByText("Weekly sync").closest<HTMLElement>("[data-slot=item]")!;

    await expect(getComputedStyle(row).borderTopColor).toBe("rgb(38, 38, 38)");
  },
});

const styles = stylex.create({
  list: {
    maxWidth: "28rem",
    width: "100%",
  },
  narrow: {
    width: "20rem",
  },
});

import * as stylex from "@stylexjs/stylex";
import { expect, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { colors, radius } from "../../foundations/tokens.stylex";
import { SidebarNested } from "./sidebar-nested";

/** Pins the sidebar's breakpoint, since the test browser's viewport is phone-sized. */
function mockWideViewport() {
  const matchMedia = window.matchMedia;
  window.matchMedia = (query) =>
    matchMedia.call(window, query === "(width < 48rem)" ? "not all" : query);
  return () => {
    window.matchMedia = matchMedia;
  };
}

const meta = preview.meta({
  title: "Blocks/Sidebar Nested",
  component: SidebarNested,
  beforeEach: mockWideViewport,
  parameters: { figma: { fill: true } },
});

/** The current page's section starts open; other sections expand on click. */
export const Default = meta.story({
  render: () => (
    <SidebarNested page="Drafts" style={styles.frame}>
      <p>Your draft invoices.</p>
    </SidebarNested>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Drafts" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const customers = canvas.getByRole("button", { name: "Customers" });
    await expect(customers).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryByRole("link", { name: "Contacts" })).toBeNull();

    await userEvent.click(customers);

    await expect(customers).toHaveAttribute("aria-expanded", "true");
    await waitFor(() => expect(canvas.getByRole("link", { name: "Contacts" })).toBeVisible());
  },
});

/** Collapsed to icons, each section opens its sub-pages in a menu, and Search expands the sidebar. */
export const Collapsed = meta.story({
  render: () => (
    <SidebarNested page="Drafts" style={styles.frame}>
      <p>Your draft invoices.</p>
    </SidebarNested>
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Toggle sidebar" });

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryByRole("searchbox")).toBeNull();

    await userEvent.click(canvas.getByRole("button", { name: "Invoices" }));
    const drafts = await screen.findByRole("menuitem", { name: "Drafts" });
    await waitFor(() => expect(drafts).toBeVisible());
    await expect(drafts).toHaveAttribute("aria-current", "page");
    await expect(screen.getByRole("menuitem", { name: "Recurring" })).toHaveAttribute(
      "href",
      "#recurring",
    );
    await userEvent.keyboard("{Escape}");

    await userEvent.click(canvas.getByRole("button", { name: "Search" }));
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await waitFor(() => expect(canvas.getByRole("searchbox", { name: "Search" })).toHaveFocus());
  },
});

const styles = stylex.create({
  frame: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
    height: "30rem",
    minHeight: 0,
  },
});

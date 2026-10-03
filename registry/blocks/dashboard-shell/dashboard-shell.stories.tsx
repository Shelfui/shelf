import * as stylex from "@stylexjs/stylex";
import { expect, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { colors, radius } from "../../foundations/tokens.stylex";
import { DashboardShell } from "./dashboard-shell";

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
  title: "Blocks/Dashboard Shell",
  component: DashboardShell,
  // Menus and tooltips render in a portal on <body>.
  parameters: { figma: { fill: true }, a11y: { context: "body" } },
  beforeEach: mockWideViewport,
});

function Page() {
  return <p>Invoices you send appear here.</p>;
}

const sidebar = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>("[data-slot=sidebar-gap]")!;

/** The current page is marked, counts sit beside their links, and the trigger collapses the sidebar. */
export const Default = meta.story({
  render: () => (
    <DashboardShell page="Invoices" style={styles.frame}>
      <Page />
    </DashboardShell>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("link", { name: /^Invoices/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(canvas.getByRole("link", { name: "Inbox 3 items" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "INV-1049 · Globex" })).toBeVisible();

    const trigger = canvas.getByRole("button", { name: "Toggle sidebar" });
    await userEvent.click(trigger);

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(sidebar(canvasElement)).toHaveAttribute("data-state", "collapsed");
  },
});

/** Search opens the command palette, as does ⌘K; choosing a result jumps to it and closes it. */
export const Search = meta.story({
  render: () => (
    <DashboardShell page="Home" style={styles.frame}>
      <Page />
    </DashboardShell>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getAllByRole("button", { name: "Search" })[0]!);
    const input = await screen.findByRole("combobox", { name: "Search" });
    await userEvent.type(input, "cust");
    await userEvent.click(await screen.findByRole("option", { name: "Customers" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(window.location.hash).toBe("#customers");

    await userEvent.keyboard("{Meta>}k{/Meta}");
    const dialog = await screen.findByRole("dialog", { name: "Search Acme" });
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
});

/** The avatar opens the account menu with who is signed in. */
export const Account = meta.story({
  render: () => (
    <DashboardShell page="Home" style={styles.frame}>
      <Page />
    </DashboardShell>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Account" }));
    const email = await screen.findByText("ada@example.com");
    await waitFor(() => expect(email).toBeVisible());
    await expect(screen.getByRole("menuitem", { name: "Log out" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  },
});

/** Collapsed to icons, the navigation keeps its links and shows labels as tooltips. */
export const IconCollapsed = meta.story({
  render: () => (
    <DashboardShell page="Invoices" defaultOpen={false} style={styles.frame}>
      <Page />
    </DashboardShell>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(sidebar(canvasElement)).toHaveAttribute("data-state", "collapsed");

    await userEvent.hover(canvas.getByRole("link", { name: "Customers" }));

    const tooltip = await screen.findByText("Customers", {
      selector: "[data-slot=tooltip-content]",
    });
    await waitFor(() => expect(tooltip).toBeVisible());
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

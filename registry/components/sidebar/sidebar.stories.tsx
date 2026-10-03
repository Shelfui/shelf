import * as stylex from "@stylexjs/stylex";
import { expect, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { colors, radius, spacing } from "../../foundations/tokens.stylex";
import { CalendarIcon, CircleCheckIcon, PlusIcon, SearchIcon } from "../icons/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  type SidebarProps,
  SidebarSeparator,
  SidebarTrigger,
} from "./sidebar";

/** Pins the sidebar's breakpoint, since the test browser's viewport is phone-sized. */
function mockNarrowViewport(narrow: boolean) {
  const matchMedia = window.matchMedia;
  window.matchMedia = (query) =>
    matchMedia.call(window, query === "(width < 48rem)" ? (narrow ? "all" : "not all") : query);
  return () => {
    window.matchMedia = matchMedia;
  };
}

const meta = preview.meta({
  title: "Components/Sidebar",
  // Tooltips and the mobile sheet render in a portal on <body>.
  parameters: { figma: {}, a11y: { context: "body" } },
  beforeEach: () => mockNarrowViewport(false),
});

const NAV = [
  { label: "Search", href: "#search", icon: SearchIcon },
  { label: "Calendar", href: "#calendar", icon: CalendarIcon },
  { label: "Tasks", href: "#tasks", icon: CircleCheckIcon },
];

function Shell({
  defaultOpen = true,
  collapsible,
}: {
  defaultOpen?: boolean;
  collapsible?: SidebarProps["collapsible"];
}) {
  return (
    <SidebarProvider defaultOpen={defaultOpen} style={styles.frame}>
      <Sidebar collapsible={collapsible}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="New task">
                <PlusIcon />
                <span>New task</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenu>
              {NAV.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton
                    isActive={label === "Calendar"}
                    tooltip={label}
                    render={<a href={href} />}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Ada Lovelace">
                <CircleCheckIcon />
                <span>Ada Lovelace</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header {...stylex.props(styles.header)}>
          <SidebarTrigger />
          <span>Calendar</span>
        </header>
      </SidebarInset>
    </SidebarProvider>
  );
}

const sidebar = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>("[data-slot=sidebar-gap]")!;

/** The trigger and Cmd/Ctrl+B toggle it; a collapsed offcanvas sidebar leaves the tab order. */
export const Default = meta.story({
  render: () => <Shell />,
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole("button", { name: "Toggle sidebar" });
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("link", { name: "Search" })).toBeVisible();

    await userEvent.click(trigger);

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(sidebar(canvasElement)).toHaveAttribute("data-state", "collapsed");
    await expect(canvasElement.querySelector("[data-slot=sidebar]")).toHaveAttribute("inert");

    await userEvent.keyboard("{Control>}b{/Control}");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{Meta>}b{/Meta}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
});

/** Collapsed to icons, the labels clip and each button shows its label as a tooltip. */
export const IconCollapsed = meta.story({
  render: () => <Shell collapsible="icon" defaultOpen={false} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(sidebar(canvasElement)).toHaveAttribute("data-collapsible", "icon");
    const search = canvas.getByRole("link", { name: "Search" });

    await userEvent.hover(search);

    const tooltip = await screen.findByText("Search", { selector: "[data-slot=tooltip-content]" });
    await waitFor(() => expect(tooltip).toBeVisible());

    await userEvent.unhover(search);
    await userEvent.click(canvas.getByRole("button", { name: "Toggle sidebar" }));
    await userEvent.hover(canvas.getByRole("link", { name: "Tasks" }));

    await new Promise((resolve) => setTimeout(resolve, 800));
    await expect(
      screen.queryByText("Tasks", { selector: "[data-slot=tooltip-content]" }),
    ).toBeNull();
  },
});

/** `isActive` marks the current page for assistive tech. */
export const ActiveItem = meta.story({
  render: () => <Shell />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Calendar" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(canvas.getByRole("link", { name: "Search" })).not.toHaveAttribute("aria-current");
  },
});

/** Below 48rem the sidebar is a modal sheet, closed until the trigger opens it. */
export const Mobile = meta.story({
  beforeEach: () => mockNarrowViewport(true),
  render: () => <Shell />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Toggle sidebar" });
    await expect(screen.queryByRole("dialog")).toBeNull();

    await userEvent.click(trigger);

    const sheet = await screen.findByRole("dialog", { name: "Sidebar" });
    await expect(sheet).toContainElement(screen.getByRole("link", { name: "Calendar" }));

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <Shell />,
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector<HTMLElement>("[data-slot=sidebar]")!;

    await expect(getComputedStyle(panel).backgroundColor).toBe("rgb(10, 10, 10)");
    await expect(getComputedStyle(panel).borderRightColor).toBe("rgb(38, 38, 38)");
  },
});

const styles = stylex.create({
  frame: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
    height: "24rem",
    minHeight: 0,
  },
  header: {
    padding: spacing["2"],
    gap: spacing["2"],
    alignItems: "center",
    display: "flex",
  },
});

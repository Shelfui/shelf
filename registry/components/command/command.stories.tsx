import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { Button } from "../button/button";
import * as Command from "./command";

const meta = preview.meta({
  title: "Components/Command",
  // Command.Dialog renders in a portal on <body>, outside the story root.
  parameters: { figma: {}, a11y: { context: "body" } },
});

type Action = { value: string; label: string; shortcut?: string };
type ActionGroup = { value: string; items: Action[] };

const GROUPS: ActionGroup[] = [
  {
    value: "Suggestions",
    items: [
      { value: "new-invoice", label: "New invoice", shortcut: "⌘N" },
      { value: "new-customer", label: "New customer" },
      { value: "search-payments", label: "Search payments" },
    ],
  },
  {
    value: "Settings",
    items: [
      { value: "profile", label: "Profile", shortcut: "⌘P" },
      { value: "billing", label: "Billing", shortcut: "⌘B" },
      { value: "team", label: "Team" },
    ],
  },
];

const ran = fn();
const valueChanged = fn();

function Palette({
  onRun = ran,
  style = styles.palette,
}: {
  onRun?: (value: string) => void;
  style?: stylex.StaticStyles;
}) {
  return (
    <Command.Root items={GROUPS} onValueChange={(value) => valueChanged(value)} style={style}>
      <Command.Input aria-label="Search commands" placeholder="Type a command or search…" />
      <Command.List aria-label="Commands">
        {(group: ActionGroup) => (
          <Command.Group key={group.value} items={group.items}>
            <Command.GroupLabel>{group.value}</Command.GroupLabel>
            <Command.Collection>
              {(item: Action) => (
                <Command.Item key={item.value} value={item} onClick={() => onRun(item.value)}>
                  {item.label}
                  {item.shortcut && <Command.Shortcut>{item.shortcut}</Command.Shortcut>}
                </Command.Item>
              )}
            </Command.Collection>
          </Command.Group>
        )}
      </Command.List>
      <Command.Empty>No results found.</Command.Empty>
    </Command.Root>
  );
}

const names = () => screen.getAllByRole("option").map((option) => option.textContent);

/** The list is always open, and typing narrows it to matching commands. */
export const Default = meta.story({
  render: () => <Palette />,
  play: async ({ canvas }) => {
    valueChanged.mockClear();
    const input = canvas.getByRole("combobox", { name: "Search commands" });

    await expect(canvas.getAllByRole("option")).toHaveLength(6);
    await expect(canvas.getByRole("group", { name: "Settings" })).toBeVisible();

    await userEvent.type(input, "new");

    await waitFor(() => expect(names()).toEqual(["New invoice⌘N", "New customer"]));
    await expect(valueChanged).toHaveBeenLastCalledWith("new");
    await expect(canvas.queryByRole("group", { name: "Settings" })).toBeNull();
  },
});

/**
 * The first match is highlighted; arrows move the highlight, and Enter runs that command.
 * The search stays as typed, ready for the next command.
 */
export const Keyboard = meta.story({
  render: () => <Palette />,
  play: async ({ canvas }) => {
    ran.mockClear();
    const input = canvas.getByRole("combobox", { name: "Search commands" });

    await userEvent.click(input);
    await waitFor(() =>
      expect(canvas.getByRole("option", { name: "New invoice" })).toHaveAttribute(
        "data-highlighted",
      ),
    );

    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("option", { name: "New customer" })).toHaveAttribute(
      "data-highlighted",
    );

    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(canvas.getByRole("option", { name: "Profile" })).toHaveAttribute(
      "data-highlighted",
    );

    await userEvent.keyboard("{Enter}");

    await expect(ran).toHaveBeenCalledWith("profile");
    await expect(input).toHaveValue("");
  },
});

/** A search with no matches shows the empty message instead of the list. */
export const NoResults = meta.story({
  render: () => <Palette />,
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole("combobox"), "refund");

    await waitFor(() => expect(canvas.getByText("No results found.")).toBeVisible());
    await expect(canvas.queryAllByRole("option")).toHaveLength(0);
  },
});

function PaletteDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open command palette
      </Button>
      <Command.Dialog open={open} onOpenChange={setOpen}>
        <Palette
          style={null}
          onRun={(value) => {
            ran(value);
            setOpen(false);
          }}
        />
      </Command.Dialog>
    </>
  );
}

/** In a dialog, the search field takes focus, and running a command closes it. */
export const InDialog = meta.story({
  render: () => <PaletteDialog />,
  play: async ({ canvas }) => {
    ran.mockClear();

    await userEvent.click(canvas.getByRole("button", { name: "Open command palette" }));
    const dialog = await screen.findByRole("dialog", { name: "Command palette" });

    await expect(dialog).toHaveAccessibleDescription("Search for a command to run.");
    const input = screen.getByRole("combobox", { name: "Search commands" });
    await waitFor(() => expect(input).toHaveFocus());
    // The dialog is the surface, so the palette drops its own border.
    await expect(getComputedStyle(input.closest("[data-slot=command]")!).borderTopWidth).toBe(
      "0px",
    );

    await userEvent.type(input, "bill");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    await userEvent.keyboard("{Enter}");

    await expect(ran).toHaveBeenCalledWith("billing");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <Palette />,
  play: async ({ canvas }) => {
    const root = canvas.getByRole("combobox").closest<HTMLElement>("[data-slot=command]")!;

    await expect(getComputedStyle(root).backgroundColor).toBe("rgb(23, 23, 23)");
    await expect(getComputedStyle(root).borderTopColor).toBe("rgb(38, 38, 38)");
  },
});

const styles = stylex.create({
  palette: {
    maxWidth: "28rem",
  },
});

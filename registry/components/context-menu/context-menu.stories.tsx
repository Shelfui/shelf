import * as stylex from "@stylexjs/stylex";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as ContextMenu from "./context-menu";

const meta = preview.meta({
  title: "Components/Context Menu",
  parameters: {
    figma: { story: "Open", root: "dropdown-menu-content" },
    a11y: { context: "body" },
  },
});

const copied = fn();

function Area({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <ContextMenu.Root defaultOpen={defaultOpen}>
      <ContextMenu.Trigger style={styles.area}>Right-click here</ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item onClick={copied}>
          Copy <ContextMenu.Shortcut>⌘C</ContextMenu.Shortcut>
        </ContextMenu.Item>
        <ContextMenu.Item>Paste</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item variant="destructive">Delete</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

/** Right-clicking the area opens the menu; choosing an item runs it and closes. */
export const Default = meta.story({
  render: () => <Area />,
  play: async ({ canvas }) => {
    copied.mockClear();

    await userEvent.pointer({ keys: "[MouseRight]", target: canvas.getByText("Right-click here") });
    await screen.findByRole("menu");

    await userEvent.click(screen.getByRole("menuitem", { name: /Copy/ }));

    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    await expect(copied).toHaveBeenCalledTimes(1);
  },
});

/** Focus moves into the menu, arrows and Enter choose an item, and the menu closes. */
export const Keyboard = meta.story({
  render: () => <Area />,
  play: async ({ canvas }) => {
    copied.mockClear();

    await userEvent.pointer({ keys: "[MouseRight]", target: canvas.getByText("Right-click here") });
    const menu = await screen.findByRole("menu");

    await waitFor(() => expect(menu.contains(document.activeElement)).toBe(true));

    await userEvent.keyboard("{ArrowDown}{Enter}");

    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    await expect(copied).toHaveBeenCalledTimes(1);
  },
});

/** Escape closes the menu without running anything. */
export const EscapeCloses = meta.story({
  render: () => <Area />,
  play: async ({ canvas }) => {
    copied.mockClear();

    await userEvent.pointer({ keys: "[MouseRight]", target: canvas.getByText("Right-click here") });
    await screen.findByRole("menu");

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    await expect(copied).not.toHaveBeenCalled();
  },
});

/** Open, showing its content. */
export const Open = meta.story({
  render: () => <Area defaultOpen />,
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <Area />,
  play: async ({ canvas }) => {
    await userEvent.pointer({ keys: "[MouseRight]", target: canvas.getByText("Right-click here") });
    const menu = await screen.findByRole("menu");

    await expect(getComputedStyle(menu).backgroundColor).toBe("rgb(23, 23, 23)");
  },
});

const styles = stylex.create({
  area: {
    borderStyle: "dashed",
    borderWidth: 1,
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    height: 120,
    width: 280,
  },
});

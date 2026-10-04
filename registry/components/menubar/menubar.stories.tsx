import { expect, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Menubar from "./menubar";

const meta = preview.meta({
  title: "Components/Menubar",
  parameters: { figma: {}, a11y: { context: "body" } },
});

function AppMenus() {
  return (
    <Menubar.Root>
      <Menubar.Menu>
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Item>
            New tab <Menubar.Shortcut>⌘T</Menubar.Shortcut>
          </Menubar.Item>
          <Menubar.Item>New window</Menubar.Item>
          <Menubar.Separator />
          <Menubar.Item>Print</Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger>Edit</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Item>Undo</Menubar.Item>
          <Menubar.Item>Redo</Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
    </Menubar.Root>
  );
}

/** Once a menu is open, ArrowRight moves to the next menu in the bar. */
export const Default = meta.story({
  render: () => <AppMenus />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("menubar")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("menuitem", { name: "File" }));

    const newTab = await screen.findByRole("menuitem", { name: /New tab/ });

    await waitFor(() => expect(newTab).toBeVisible());

    await userEvent.keyboard("{ArrowRight}");

    const undo = await screen.findByRole("menuitem", { name: "Undo" });

    await waitFor(() => expect(undo).toBeVisible());
    await waitFor(() => expect(screen.queryByRole("menuitem", { name: /New tab/ })).toBeNull());
  },
});

/** Enter opens a menu with focus inside it; Escape closes it and returns focus to the bar. */
export const Keyboard = meta.story({
  render: () => <AppMenus />,
  play: async ({ canvas }) => {
    const file = canvas.getByRole("menuitem", { name: "File" });

    await userEvent.tab();
    await expect(file).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    const menu = await screen.findByRole("menu");

    await waitFor(() => expect(menu.contains(document.activeElement)).toBe(true));

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    await waitFor(() => expect(file).toHaveFocus());
  },
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <AppMenus />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("menuitem", { name: "File" }));
    const menu = await screen.findByRole("menu");

    await expect(getComputedStyle(menu).backgroundColor).toBe("rgb(23, 23, 23)");
  },
});

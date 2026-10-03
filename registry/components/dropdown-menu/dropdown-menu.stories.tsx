import { expect, fn, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { Button } from "../button/button";
import * as DropdownMenu from "./dropdown-menu";

const meta = preview.meta({
  title: "Components/Dropdown Menu",
  parameters: {
    figma: { story: "Open", root: "dropdown-menu-content" },
    a11y: { context: "body" },
  },
});

const renamed = fn();

function Options({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <DropdownMenu.Root defaultOpen={defaultOpen}>
      <DropdownMenu.Trigger render={<Button variant="outline" />}>Options</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Group>
          <DropdownMenu.Label>Invoice</DropdownMenu.Label>
          <DropdownMenu.Item onClick={renamed}>
            Rename <DropdownMenu.Shortcut>⌘R</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
          <DropdownMenu.Item>Duplicate</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Move to</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item>Drafts</DropdownMenu.Item>
              <DropdownMenu.Item>Archive</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item variant="destructive">Delete</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

const closed = () => waitFor(() => expect(screen.queryByRole("menu")).toBeNull());

/** Arrow keys move through items, Enter runs one and closes, and focus returns. */
export const Default = meta.story({
  render: () => <Options />,
  play: async ({ canvas }) => {
    renamed.mockClear();
    const trigger = canvas.getByRole("button", { name: "Options" });

    await userEvent.click(trigger);
    await screen.findByRole("menu");
    await userEvent.keyboard("{ArrowDown}");

    await waitFor(() => expect(screen.getByRole("menuitem", { name: /Rename/ })).toHaveFocus());

    await userEvent.keyboard("{Enter}");
    await closed();

    await expect(renamed).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(trigger).toHaveFocus());
  },
});

/** ArrowRight opens a submenu and ArrowLeft closes it again. */
export const Submenu = meta.story({
  render: () => <Options />,
  play: async ({ canvas }) => {
    canvas.getByRole("button", { name: "Options" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: /Rename/ })).toHaveFocus());

    const moveTo = screen.getByRole("menuitem", { name: "Move to" });
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await waitFor(() => expect(moveTo).toHaveFocus());

    await userEvent.keyboard("{ArrowRight}");

    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Drafts" })).toHaveFocus());

    await userEvent.keyboard("{ArrowLeft}");

    await waitFor(() => expect(screen.queryByRole("menuitem", { name: "Drafts" })).toBeNull());
    await waitFor(() => expect(moveTo).toHaveFocus());
  },
});

function View() {
  return (
    <DropdownMenu.Root defaultOpen>
      <DropdownMenu.Trigger render={<Button variant="outline" />}>View</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.CheckboxItem defaultChecked>Show status bar</DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem>Show activity</DropdownMenu.CheckboxItem>
        <DropdownMenu.Separator />
        <DropdownMenu.RadioGroup defaultValue="comfortable">
          <DropdownMenu.Label>Density</DropdownMenu.Label>
          <DropdownMenu.RadioItem value="compact">Compact</DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="comfortable">Comfortable</DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

/** Checkbox and radio items report their state and keep the menu open when toggled. */
export const CheckboxAndRadioItems = meta.story({
  render: () => <View />,
  play: async () => {
    const activity = await screen.findByRole("menuitemcheckbox", { name: "Show activity" });

    await expect(screen.getByRole("menuitemcheckbox", { name: "Show status bar" })).toBeChecked();

    await userEvent.click(activity);

    await expect(activity).toBeChecked();

    const compact = screen.getByRole("menuitemradio", { name: "Compact" });
    await userEvent.click(compact);

    await expect(compact).toBeChecked();
    await expect(screen.getByRole("menuitemradio", { name: "Comfortable" })).not.toBeChecked();
  },
});

/** Open, showing its content. */
export const Open = meta.story({
  render: () => <Options defaultOpen />,
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <Options defaultOpen />,
  play: async () => {
    const menu = await screen.findByRole("menu");

    await expect(getComputedStyle(menu).backgroundColor).toBe("rgb(23, 23, 23)");
  },
});

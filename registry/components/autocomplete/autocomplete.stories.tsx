import { expect, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Autocomplete from "./autocomplete";

const meta = preview.meta({
  title: "Components/Autocomplete",
  parameters: { figma: {}, a11y: { context: "body" } },
});

const TAGS = ["design", "development", "documentation", "marketing", "sales"];

function Tag({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Autocomplete.Root items={TAGS} defaultOpen={defaultOpen}>
      <Autocomplete.Input aria-label="Tag" placeholder="Add a tag" />
      <Autocomplete.Content>
        <Autocomplete.Empty>No matching tags.</Autocomplete.Empty>
        <Autocomplete.List>
          {(tag: string) => (
            <Autocomplete.Item key={tag} value={tag}>
              {tag}
            </Autocomplete.Item>
          )}
        </Autocomplete.List>
      </Autocomplete.Content>
    </Autocomplete.Root>
  );
}

/** Suggestions narrow as you type; picking one fills the input. */
export const Default = meta.story({
  render: () => <Tag />,
  play: async ({ canvas }) => {
    const input = canvas.getByRole("combobox", { name: "Tag" });

    await userEvent.type(input, "d");

    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(3));

    await userEvent.click(screen.getByRole("option", { name: "documentation" }));

    await expect(input).toHaveValue("documentation");
  },
});

/** Arrow keys move through the suggestions, Enter picks one, and Escape closes the list. */
export const Keyboard = meta.story({
  render: () => <Tag />,
  play: async ({ canvas }) => {
    const input = canvas.getByRole("combobox", { name: "Tag" });

    await userEvent.type(input, "d");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(3));

    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    await expect(input).toHaveValue("development");
    await expect(input).toHaveFocus();

    await userEvent.clear(input);
    await userEvent.type(input, "d");
    await screen.findByRole("listbox");

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    await expect(input).toHaveFocus();
  },
});

/** Any text is a valid value, even with no suggestion for it, and it stays after leaving the field. */
export const FreeText = meta.story({
  render: () => <Tag />,
  play: async ({ canvas }) => {
    const input = canvas.getByRole("combobox", { name: "Tag" });

    await userEvent.type(input, "research");

    const empty = await screen.findByText("No matching tags.");

    await waitFor(() => expect(empty).toBeVisible());

    await userEvent.tab();

    await expect(input).not.toHaveFocus();
    await expect(input).toHaveValue("research");
  },
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <Tag defaultOpen />,
  play: async () => {
    const list = await screen.findByRole("listbox");
    const popup = list.closest<HTMLElement>("[data-slot=autocomplete-content]");

    await expect(getComputedStyle(popup!).backgroundColor).toBe("rgb(23, 23, 23)");
  },
});

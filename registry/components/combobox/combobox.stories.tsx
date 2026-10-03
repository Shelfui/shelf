import { expect, fn, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Combobox from "./combobox";

const meta = preview.meta({
  title: "Components/Combobox",
  parameters: { figma: {}, a11y: { context: "body" } },
});

const COUNTRIES = ["Denmark", "Finland", "Iceland", "Norway", "Sweden"];

const changed = fn();

function Country({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Combobox.Root items={COUNTRIES} defaultOpen={defaultOpen} onValueChange={changed}>
      <Combobox.Input aria-label="Country" placeholder="Search countries" />
      <Combobox.Content>
        <Combobox.Empty>No countries found.</Combobox.Empty>
        <Combobox.List>
          {(country: string) => (
            <Combobox.Item key={country} value={country}>
              {country}
            </Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Content>
    </Combobox.Root>
  );
}

/** Typing filters the list; choosing an option fills the input and reports the value. */
export const Default = meta.story({
  render: () => <Country />,
  play: async ({ canvas }) => {
    changed.mockClear();
    const input = canvas.getByRole("combobox", { name: "Country" });

    await userEvent.type(input, "fin");

    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));

    await userEvent.keyboard("{ArrowDown}{Enter}");

    await expect(input).toHaveValue("Finland");
    await expect(changed).toHaveBeenLastCalledWith("Finland", expect.anything());
  },
});

export const NoMatches = meta.story({
  render: () => <Country />,
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole("combobox", { name: "Country" }), "xyz");

    const empty = await screen.findByText("No countries found.");

    await waitFor(() => expect(empty).toBeVisible());
    await expect(screen.queryAllByRole("option")).toHaveLength(0);
  },
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <Country defaultOpen />,
  play: async () => {
    const list = await screen.findByRole("listbox");
    const popup = list.closest<HTMLElement>("[data-slot=combobox-content]");

    await expect(getComputedStyle(popup!).backgroundColor).toBe("rgb(23, 23, 23)");
  },
});

import { useState } from "react";
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

const FRUITS = ["Apple", "Banana", "Cherry", "Mango", "Peach"];

function Fruits() {
  return (
    <Combobox.Root multiple items={FRUITS} defaultValue={["Apple"]}>
      <Combobox.Chips>
        <Combobox.Value>
          {(chosen: string[]) =>
            chosen.map((fruit) => <Combobox.Chip key={fruit}>{fruit}</Combobox.Chip>)
          }
        </Combobox.Value>
        <Combobox.ChipInput aria-label="Fruits" placeholder="Add a fruit" />
      </Combobox.Chips>
      <Combobox.Content>
        <Combobox.Empty>No fruit found.</Combobox.Empty>
        <Combobox.List>
          {(fruit: string) => (
            <Combobox.Item key={fruit} value={fruit}>
              {fruit}
            </Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Content>
    </Combobox.Root>
  );
}

/** Each pick becomes a chip; a chip's button removes it. */
export const Multiple = meta.story({
  render: () => <Fruits />,
  play: async ({ canvas }) => {
    const input = canvas.getByRole("combobox", { name: "Fruits" });

    await userEvent.type(input, "man");
    await userEvent.keyboard("{ArrowDown}{Enter}");

    await expect(canvas.getByText("Mango")).toBeVisible();
    await expect(canvas.getByText("Apple")).toBeVisible();

    await userEvent.click(canvas.getAllByRole("button", { name: "Remove" })[0]!);

    await waitFor(() => expect(canvas.queryByText("Apple")).toBeNull());
  },
});

function Tags() {
  const [tags, setTags] = useState<string[]>(["design"]);
  const [text, setText] = useState("");

  return (
    <Combobox.Root
      multiple
      items={tags}
      value={tags}
      onValueChange={setTags}
      inputValue={text}
      onInputValueChange={setText}
      open={false}
    >
      <Combobox.Chips>
        <Combobox.Value>
          {(chosen: string[]) =>
            chosen.map((tag) => <Combobox.Chip key={tag}>{tag}</Combobox.Chip>)
          }
        </Combobox.Value>
        <Combobox.ChipInput
          aria-label="Tags"
          placeholder="Add a tag"
          onKeyDown={(event) => {
            const tag = text.trim();
            if (event.key !== "Enter" || !tag) return;
            event.preventDefault();
            if (!tags.includes(tag)) setTags([...tags, tag]);
            setText("");
          }}
        />
      </Combobox.Chips>
    </Combobox.Root>
  );
}

/** Free-text tags: Enter creates a chip from whatever was typed. */
export const CreatableTags = meta.story({
  render: () => <Tags />,
  play: async ({ canvas }) => {
    const input = canvas.getByRole("combobox", { name: "Tags" });

    await userEvent.type(input, "research{Enter}");

    await expect(canvas.getByText("research")).toBeVisible();
    await expect(input).toHaveValue("");
  },
});

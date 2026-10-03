import { expect, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { SearchIcon } from "../icons/icons";
import { Kbd } from "../kbd/kbd";
import * as InputGroup from "./input-group";

const meta = preview.meta({
  title: "Components/Input Group",
  component: InputGroup.Root,
  decorators: [(Story) => <div style={{ width: 320 }}>{Story()}</div>],
  parameters: { figma: {} },
});

export const Default = meta.story({
  render: () => (
    <InputGroup.Root>
      <InputGroup.Addon>
        <SearchIcon />
      </InputGroup.Addon>
      <InputGroup.Input aria-label="Search" placeholder="Search invoices" />
      <InputGroup.Addon>
        <Kbd>⌘K</Kbd>
      </InputGroup.Addon>
    </InputGroup.Root>
  ),
  play: async ({ canvas, canvasElement }) => {
    const input = canvas.getByRole("textbox", { name: "Search" });
    const group = canvasElement.querySelector<HTMLElement>("[data-slot=input-group]")!;

    await expect(getComputedStyle(group).borderTopColor).toBe("rgb(224, 224, 224)");

    await userEvent.type(input, "acme");

    await expect(input).toHaveValue("acme");
    // The border color transitions, so wait for it to settle.
    await waitFor(() => expect(getComputedStyle(group).borderTopColor).toBe("rgb(143, 143, 143)"));
  },
});

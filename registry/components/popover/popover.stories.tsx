import { expect, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { Button } from "../button/button";
import * as Field from "../field/field";
import { Input } from "../input/input";
import * as Popover from "./popover";

const meta = preview.meta({
  title: "Components/Popover",
  parameters: { figma: { story: "Open", root: "popover-content" }, a11y: { context: "body" } },
});

function Dimensions({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Popover.Root defaultOpen={defaultOpen}>
      <Popover.Trigger render={<Button variant="outline" />}>Dimensions</Popover.Trigger>
      <Popover.Content>
        <Popover.Header>
          <Popover.Title>Dimensions</Popover.Title>
          <Popover.Description>Set the size of the layer.</Popover.Description>
        </Popover.Header>
        <Field.Root>
          <Field.Label>Width</Field.Label>
          <Input defaultValue="100%" />
        </Field.Root>
      </Popover.Content>
    </Popover.Root>
  );
}

/** Opens from its trigger, holds interactive content, and closes on Escape. */
export const Default = meta.story({
  render: () => <Dimensions />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Dimensions" });

    await userEvent.click(trigger);
    const popover = await screen.findByRole("dialog", { name: "Dimensions" });

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(popover).toHaveAccessibleDescription("Set the size of the layer.");

    await userEvent.click(screen.getByRole("textbox", { name: "Width" }));
    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
});

/** Open, showing its content. */
export const Open = meta.story({
  render: () => <Dimensions defaultOpen />,
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <Dimensions defaultOpen />,
  play: async () => {
    const popover = await screen.findByRole("dialog");

    await expect(getComputedStyle(popover).backgroundColor).toBe("rgb(23, 23, 23)");
  },
});

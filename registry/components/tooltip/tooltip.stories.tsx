import { expect, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { Button } from "../button/button";
import { PlusIcon } from "../icons/icons";
import * as Tooltip from "./tooltip";

const meta = preview.meta({
  title: "Components/Tooltip",
  parameters: { figma: { story: "Open", root: "tooltip-content" }, a11y: { context: "body" } },
});

function AddButton({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Tooltip.Root defaultOpen={defaultOpen}>
      <Tooltip.Trigger delay={0} render={<Button size="icon" variant="outline" aria-label="Add" />}>
        <PlusIcon />
      </Tooltip.Trigger>
      <Tooltip.Content>Add to library</Tooltip.Content>
    </Tooltip.Root>
  );
}

const shown = async () => {
  const tooltip = await screen.findByText("Add to library");
  await waitFor(() => expect(tooltip).toBeVisible());
};

/** Shows on hover and on keyboard focus, and hides on Escape. The button keeps its own name. */
export const Default = meta.story({
  render: () => <AddButton />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Add" });

    await userEvent.hover(trigger);

    await shown();

    await userEvent.unhover(trigger);
    await waitFor(() => expect(screen.queryByText("Add to library")).toBeNull());

    await userEvent.tab();

    await expect(trigger).toHaveFocus();
    await shown();

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByText("Add to library")).toBeNull());
  },
});

/** Open, showing its content. */
export const Open = meta.story({
  render: () => <AddButton defaultOpen />,
});

/** The tooltip inverts the theme, so it reads as dark on light and light on dark. */
export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <AddButton defaultOpen />,
  play: async () => {
    const tooltip = await screen.findByText("Add to library");

    await expect(getComputedStyle(tooltip).backgroundColor).toBe("rgb(237, 237, 237)");
  },
});

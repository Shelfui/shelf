import { expect, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { Button } from "../button/button";
import { Toggle } from "../toggle/toggle";
import * as Toolbar from "./toolbar";

const meta = preview.meta({
  title: "Components/Toolbar",
  component: Toolbar.Root,
  parameters: { figma: {} },
});

function Formatting() {
  return (
    <Toolbar.Root aria-label="Formatting">
      <Toolbar.Group aria-label="Text style">
        <Toolbar.Button render={<Toggle size="sm" />}>Bold</Toolbar.Button>
        <Toolbar.Button render={<Toggle size="sm" />}>Italic</Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Button render={<Button variant="ghost" size="sm" />}>Share</Toolbar.Button>
    </Toolbar.Root>
  );
}

/** The toolbar is one Tab stop; arrow keys move between its controls. */
export const Default = meta.story({
  render: () => <Formatting />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("toolbar", { name: "Formatting" })).toBeInTheDocument();

    await userEvent.tab();

    await expect(canvas.getByRole("button", { name: "Bold" })).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}{ArrowRight}");

    await expect(canvas.getByRole("button", { name: "Share" })).toHaveFocus();

    await userEvent.tab();

    await expect(
      canvas.getByRole("toolbar").contains(canvasElement.ownerDocument.activeElement),
    ).toBe(false);
  },
});

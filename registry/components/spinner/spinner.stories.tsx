import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import { Button } from "../button/button";
import { Spinner } from "./spinner";

const meta = preview.meta({
  title: "Components/Spinner",
  component: Spinner,
  parameters: { figma: {} },
});

export const Default = meta.story({
  play: async ({ canvas }) => {
    const spinner = canvas.getByRole("status", { name: "Loading" });

    await expect(getComputedStyle(spinner).animationName).not.toBe("none");
  },
});

/** Inside a button the spinner is decorative; the button keeps its name. */
export const InButton = meta.story({
  render: () => (
    <Button disabled>
      <Spinner aria-hidden />
      Saving
    </Button>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Saving" })).toBeDisabled();
    await expect(canvas.queryByRole("status")).toBeNull();
  },
});

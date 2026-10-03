import { expect, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { Button } from "../button/button";
import * as Field from "../field/field";
import { Input } from "../input/input";
import * as Drawer from "./drawer";

const meta = preview.meta({
  title: "Components/Drawer",
  parameters: { figma: { story: "Open", root: "drawer-content" }, a11y: { context: "body" } },
});

type Direction = "down" | "up" | "left" | "right";

function EditProfile({
  swipeDirection,
  defaultOpen = false,
}: {
  swipeDirection?: Direction;
  defaultOpen?: boolean;
}) {
  return (
    <Drawer.Root swipeDirection={swipeDirection} defaultOpen={defaultOpen}>
      <Drawer.Trigger render={<Button variant="outline" />}>Edit profile</Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Edit profile</Drawer.Title>
          <Drawer.Description>Changes show on your invoices.</Drawer.Description>
        </Drawer.Header>
        <Field.Root>
          <Field.Label>Name</Field.Label>
          <Input defaultValue="Ada Lovelace" />
        </Field.Root>
        <Drawer.Footer>
          <Drawer.Close render={<Button />}>Save</Drawer.Close>
          <Drawer.Close render={<Button variant="outline" />}>Cancel</Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Root>
  );
}

const closed = () =>
  waitFor(() => {
    if (screen.queryByRole("dialog")) throw new Error("drawer is still open");
  });

/** A bottom sheet: opens from its trigger, closes on Escape, and returns focus. */
export const Default = meta.story({
  render: () => <EditProfile />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Edit profile" });

    await userEvent.click(trigger);
    const drawer = await screen.findByRole("dialog", { name: "Edit profile" });

    await waitFor(() =>
      expect(Math.round(drawer.getBoundingClientRect().bottom)).toBe(window.innerHeight),
    );

    await userEvent.keyboard("{Escape}");
    await closed();

    await waitFor(() => expect(trigger).toHaveFocus());
  },
});

/** `swipeDirection="right"` makes it a side panel on the right edge. */
export const Right = meta.story({
  render: () => <EditProfile swipeDirection="right" defaultOpen />,
  play: async () => {
    const drawer = await screen.findByRole("dialog", { name: "Edit profile" });

    await waitFor(() =>
      expect(Math.round(drawer.getBoundingClientRect().right)).toBe(
        document.documentElement.clientWidth,
      ),
    );
    await expect(Math.round(drawer.getBoundingClientRect().top)).toBe(0);
  },
});

export const Left = meta.story({
  render: () => <EditProfile swipeDirection="left" defaultOpen />,
  play: async () => {
    const drawer = await screen.findByRole("dialog");

    await waitFor(() => expect(Math.round(drawer.getBoundingClientRect().left)).toBe(0));
  },
});

/** Open, showing its content. */
export const Open = meta.story({
  render: () => <EditProfile defaultOpen />,
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <EditProfile swipeDirection="right" defaultOpen />,
  play: async () => {
    const drawer = await screen.findByRole("dialog");

    await expect(getComputedStyle(drawer).backgroundColor).toBe("rgb(10, 10, 10)");
  },
});

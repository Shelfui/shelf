import { expect, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Avatar from "./avatar";

const SIZES: Avatar.AvatarSize[] = ["sm", "default", "lg"];

const meta = preview.meta({
  title: "Components/Avatar",
  component: Avatar.Root,
  argTypes: {
    size: { control: "select", options: SIZES },
  },
  parameters: { figma: {} },
});

const PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#8a7"/></svg>',
  );

export const Default = meta.story({
  render: (args) => (
    <Avatar.Root {...args}>
      <Avatar.Image src={PHOTO} alt="Ada Lovelace" />
      <Avatar.Fallback>AL</Avatar.Fallback>
    </Avatar.Root>
  ),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("img", { name: "Ada Lovelace" })).toBeVisible();
    await expect(canvas.queryByText("AL")).toBeNull();
  },
});

/** When the image fails, the initials show instead. */
export const Fallback = meta.story({
  render: () => (
    <Avatar.Root>
      <Avatar.Image src="/missing.png" alt="Grace Hopper" />
      <Avatar.Fallback>GH</Avatar.Fallback>
    </Avatar.Root>
  ),
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByText("GH")).toBeVisible());
    await expect(canvas.queryByRole("img")).toBeNull();
  },
});

export const Sizes = meta.story({
  render: () => (
    <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
      {(["sm", "default", "lg"] as const).map((size) => (
        <Avatar.Root key={size} size={size}>
          <Avatar.Fallback>AL</Avatar.Fallback>
        </Avatar.Root>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const widths = [...canvasElement.querySelectorAll("[data-slot=avatar]")].map(
      (avatar) => avatar.getBoundingClientRect().width,
    );

    await expect(widths).toEqual([24, 32, 40]);
  },
});

/** The badge sits on the corner, outside the circle, and scales with the avatar. */
export const WithBadge = meta.story({
  render: () => (
    <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
      {(["sm", "default", "lg"] as const).map((size) => (
        <Avatar.Root key={size} size={size}>
          <Avatar.Image src={PHOTO} alt="Ada Lovelace, online" />
          <Avatar.Fallback>AL</Avatar.Fallback>
          <Avatar.Badge />
        </Avatar.Root>
      ))}
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await waitFor(() =>
      expect(canvas.getAllByRole("img", { name: "Ada Lovelace, online" })).toHaveLength(3),
    );
    const badges = [...canvasElement.querySelectorAll("[data-slot=avatar-badge]")];
    const widths = badges.map((badge) => badge.getBoundingClientRect().width);

    await expect(widths[0]).toBeLessThan(widths[2]!);
    for (const badge of badges) {
      const avatar = badge.closest("[data-slot=avatar]")!.getBoundingClientRect();
      const dot = badge.getBoundingClientRect();
      await expect(dot.width).toBeGreaterThan(0);
      await expect(dot.right).toBeCloseTo(avatar.right, 0);
      await expect(dot.bottom).toBeCloseTo(avatar.bottom, 0);
    }
  },
});

const PEOPLE = [
  ["Ada Lovelace", "AL"],
  ["Grace Hopper", "GH"],
  ["Alan Turing", "AT"],
] as const;

export const Group = meta.story({
  render: () => (
    <Avatar.Group>
      {PEOPLE.map(([name, initials]) => (
        <Avatar.Root key={name}>
          <Avatar.Image src={PHOTO} alt={name} />
          <Avatar.Fallback>{initials}</Avatar.Fallback>
        </Avatar.Root>
      ))}
    </Avatar.Group>
  ),
  play: async ({ canvas }) => {
    const [first, second] = await Promise.all(
      PEOPLE.slice(0, 2).map(([name]) => canvas.findByRole("img", { name })),
    );

    await expect(second!.getBoundingClientRect().left).toBeLessThan(
      first!.getBoundingClientRect().right,
    );
  },
});

/** A count for the people who don't fit, matching the avatars' size. */
export const GroupWithCount = meta.story({
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {(["sm", "default", "lg"] as const).map((size) => (
        <Avatar.Group key={size}>
          {PEOPLE.map(([name, initials]) => (
            <Avatar.Root key={name} size={size}>
              <Avatar.Fallback>{initials}</Avatar.Fallback>
            </Avatar.Root>
          ))}
          <Avatar.GroupCount size={size}>+3</Avatar.GroupCount>
        </Avatar.Group>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const counts = canvas.getAllByText("+3");

    await expect(counts).toHaveLength(3);
    for (const count of counts) await expect(count).toBeVisible();
    await expect(counts.map((count) => count.getBoundingClientRect().width)).toEqual([24, 32, 40]);
  },
});

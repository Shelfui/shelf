import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { expect, fireEvent, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { colors, radius, typography } from "../../foundations/tokens.stylex";
import * as Resizable from "./resizable";

const meta = preview.meta({
  title: "Components/Resizable",
  parameters: { figma: {} },
});

function Frame({ children }: { children: ReactNode }) {
  return <div {...stylex.props(styles.frame)}>{children}</div>;
}

function Label({ children }: { children: ReactNode }) {
  return <div {...stylex.props(styles.label)}>{children}</div>;
}

function TwoPanels() {
  return (
    <Frame>
      <Resizable.Group>
        <Resizable.Panel minSize="20">
          <Label>Sidebar</Label>
        </Resizable.Panel>
        <Resizable.Handle withHandle aria-label="Resize sidebar" />
        <Resizable.Panel minSize="20">
          <Label>Content</Label>
        </Resizable.Panel>
      </Resizable.Group>
    </Frame>
  );
}

const valueOf = (element: HTMLElement) => Number(element.getAttribute("aria-valuenow"));

/** Two panels split evenly by a vertical separator with a grip. */
export const Default = meta.story({
  render: () => <TwoPanels />,
  play: async ({ canvas, canvasElement }) => {
    const handle = canvas.getByRole("separator", { name: "Resize sidebar" });

    await expect(canvasElement.querySelectorAll('[data-slot="resizable-panel"]')).toHaveLength(2);
    await expect(canvasElement.querySelector('[data-slot="resizable-grip"]')).toBeVisible();
    await expect(handle).toHaveAttribute("aria-orientation", "vertical");
    await waitFor(() => expect(valueOf(handle)).toBe(50));
  },
});

/** Arrow keys resize the panel before the handle; Home and End jump to its limits. */
export const Keyboard = meta.story({
  render: () => <TwoPanels />,
  play: async ({ canvas }) => {
    const handle = canvas.getByRole("separator", { name: "Resize sidebar" });
    await waitFor(() => expect(valueOf(handle)).toBe(50));

    await userEvent.tab();
    await expect(handle).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(valueOf(handle)).toBeGreaterThan(50));

    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await waitFor(() => expect(valueOf(handle)).toBeLessThan(50));

    await userEvent.keyboard("{Home}");
    await waitFor(() => expect(valueOf(handle)).toBe(20));

    await userEvent.keyboard("{End}");
    await waitFor(() => expect(valueOf(handle)).toBe(80));
  },
});

/** The pointer grabs the handle a few pixels to either side of its 1px line. */
export const HitArea = meta.story({
  render: () => <TwoPanels />,
  play: async ({ canvas }) => {
    const handle = canvas.getByRole("separator", { name: "Resize sidebar" });
    await waitFor(() => expect(valueOf(handle)).toBe(50));
    const bounds = handle.getBoundingClientRect();

    await fireEvent.pointerMove(document, { clientX: bounds.left + 4, clientY: bounds.top + 20 });

    await waitFor(() => expect(handle).toHaveAttribute("data-separator", "hover"));

    await fireEvent.pointerMove(document, { clientX: bounds.left + 40, clientY: bounds.top + 20 });

    await waitFor(() => expect(handle).toHaveAttribute("data-separator", "inactive"));
  },
});

/** Panels stack; the handle is a horizontal line and Up and Down resize. */
export const Vertical = meta.story({
  render: () => (
    <Frame>
      <Resizable.Group orientation="vertical">
        <Resizable.Panel defaultSize="30">
          <Label>Header</Label>
        </Resizable.Panel>
        <Resizable.Handle aria-label="Resize header" />
        <Resizable.Panel>
          <Label>Content</Label>
        </Resizable.Panel>
      </Resizable.Group>
    </Frame>
  ),
  play: async ({ canvas }) => {
    const handle = canvas.getByRole("separator", { name: "Resize header" });
    await waitFor(() => expect(valueOf(handle)).toBe(30));
    await expect(handle).toHaveAttribute("aria-orientation", "horizontal");

    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");

    await waitFor(() => expect(valueOf(handle)).toBeGreaterThan(30));
  },
});

/** A group inside a panel: a sidebar beside content stacked over a bottom panel. */
export const Nested = meta.story({
  render: () => (
    <Frame>
      <Resizable.Group>
        <Resizable.Panel defaultSize="30">
          <Label>Sidebar</Label>
        </Resizable.Panel>
        <Resizable.Handle withHandle aria-label="Resize sidebar" />
        <Resizable.Panel>
          <Resizable.Group orientation="vertical">
            <Resizable.Panel defaultSize="70">
              <Label>Content</Label>
            </Resizable.Panel>
            <Resizable.Handle withHandle aria-label="Resize terminal" />
            <Resizable.Panel>
              <Label>Terminal</Label>
            </Resizable.Panel>
          </Resizable.Group>
        </Resizable.Panel>
      </Resizable.Group>
    </Frame>
  ),
  play: async ({ canvas }) => {
    const sidebar = canvas.getByRole("separator", { name: "Resize sidebar" });
    const terminal = canvas.getByRole("separator", { name: "Resize terminal" });

    await expect(sidebar).toHaveAttribute("aria-orientation", "vertical");
    await expect(terminal).toHaveAttribute("aria-orientation", "horizontal");
    await waitFor(() => expect(valueOf(terminal)).toBe(70));

    await userEvent.tab();
    await userEvent.tab();
    await expect(terminal).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");

    await waitFor(() => expect(valueOf(terminal)).toBeLessThan(70));
    await expect(valueOf(sidebar)).toBe(30);
  },
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <TwoPanels />,
  play: async ({ canvas, canvasElement }) => {
    const handle = canvas.getByRole("separator", { name: "Resize sidebar" });
    const grip = canvasElement.querySelector<HTMLElement>('[data-slot="resizable-grip"]')!;

    await expect(getComputedStyle(handle).backgroundColor).toBe("rgb(38, 38, 38)");
    await expect(getComputedStyle(grip).backgroundColor).toBe("rgb(10, 10, 10)");
  },
});

const styles = stylex.create({
  frame: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
    height: "14rem",
    width: "28rem",
  },
  label: {
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: typography.fontSizeSm,
    justifyContent: "center",
    height: "100%",
  },
});

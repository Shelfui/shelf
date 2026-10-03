import * as stylex from "@stylexjs/stylex";
import { expect, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { ScrollArea } from "./scroll-area";

const meta = preview.meta({
  title: "Components/Scroll Area",
  component: ScrollArea,
  parameters: { figma: {} },
});

const styles = stylex.create({
  area: { height: "12rem", width: "16rem" },
});

const TAGS = Array.from({ length: 40 }, (_, index) => `v1.2.${index}`);

/** The content scrolls natively inside a fixed height; the scrollbar shows on hover and while scrolling. */
export const Default = meta.story({
  render: () => (
    <ScrollArea style={styles.area}>
      {TAGS.map((tag) => (
        <div key={tag} style={{ padding: "4px 12px" }}>
          {tag}
        </div>
      ))}
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;
    const scrollbar = canvasElement.querySelector<HTMLElement>(
      "[data-slot=scroll-area-scrollbar][data-orientation=vertical]",
    )!;

    await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);

    await expect(getComputedStyle(scrollbar).opacity).toBe("0");

    await userEvent.hover(viewport);

    await waitFor(() => expect(getComputedStyle(scrollbar).opacity).toBe("1"));
  },
});

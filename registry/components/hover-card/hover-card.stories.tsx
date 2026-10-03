import { expect, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as HoverCard from "./hover-card";

const meta = preview.meta({
  title: "Components/Hover Card",
  parameters: { figma: { story: "Open", root: "hover-card-content" }, a11y: { context: "body" } },
});

function Customer({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <HoverCard.Root defaultOpen={defaultOpen}>
      <HoverCard.Trigger href="#acme" delay={0}>
        Acme Inc.
      </HoverCard.Trigger>
      <HoverCard.Content>
        <strong>Acme Inc.</strong>
        <p style={{ margin: "4px 0 0" }}>12 open invoices, $48,200 outstanding.</p>
      </HoverCard.Content>
    </HoverCard.Root>
  );
}

/** Previews on hover; the trigger stays an ordinary link. */
export const Default = meta.story({
  render: () => <Customer />,
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Acme Inc." });

    await expect(link).toHaveAttribute("href", "#acme");

    await userEvent.hover(link);

    const card = await screen.findByText(/12 open invoices/);

    await waitFor(() => expect(card).toBeVisible());

    await userEvent.unhover(link);

    await waitFor(() => expect(screen.queryByText(/12 open invoices/)).toBeNull(), {
      timeout: 2000,
    });
  },
});

/** Open, showing its content. */
export const Open = meta.story({
  render: () => <Customer defaultOpen />,
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <Customer defaultOpen />,
  play: async () => {
    const card = (await screen.findByText(/12 open invoices/)).closest<HTMLElement>(
      "[data-slot=hover-card-content]",
    );

    await expect(getComputedStyle(card!).backgroundColor).toBe("rgb(23, 23, 23)");
  },
});

import { expect, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as NavigationMenu from "./navigation-menu";

const meta = preview.meta({
  title: "Components/Navigation Menu",
  parameters: { figma: {}, a11y: { context: "body" } },
});

function Site() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="#invoicing">Invoicing</NavigationMenu.Link>
            <NavigationMenu.Link href="#expenses">Expenses</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#pricing">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

/** A trigger opens its panel of links in the shared surface; Escape closes it. */
export const Default = meta.story({
  render: () => <Site />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Products" });

    await expect(canvas.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "#pricing");

    await userEvent.click(trigger);
    const invoicing = await screen.findByRole("link", { name: "Invoicing" });

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await waitFor(() => expect(invoicing).toBeVisible());

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("link", { name: "Invoicing" })).toBeNull());
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveFocus();
  },
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <Site />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Products" }));
    await screen.findByRole("link", { name: "Invoicing" });
    const popup = document.querySelector<HTMLElement>("[data-slot=navigation-menu-popup]")!;

    await expect(getComputedStyle(popup).backgroundColor).toBe("rgb(23, 23, 23)");

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("link", { name: "Invoicing" })).toBeNull());
  },
});

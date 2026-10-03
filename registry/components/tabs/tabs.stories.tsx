import type { ComponentProps } from "react";
import { expect, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Tabs from "./tabs";

const meta = preview.meta({
  title: "Components/Tabs",
  component: Tabs.Root,
  parameters: { figma: {} },
});

function Invoice(props: ComponentProps<typeof Tabs.Root>) {
  return (
    <Tabs.Root defaultValue="overview" {...props}>
      <Tabs.List>
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="activity">Activity</Tabs.Tab>
        <Tabs.Tab value="settings" disabled>
          Settings
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview">Amount due: $1,200.00</Tabs.Panel>
      <Tabs.Panel value="activity">Sent to Acme Inc. on March 3.</Tabs.Panel>
      <Tabs.Panel value="settings">Reminders are on.</Tabs.Panel>
    </Tabs.Root>
  );
}

/** Clicking a tab shows its panel. Arrow keys move focus; a disabled tab can be focused but not opened. */
export const Default = meta.story({
  render: () => <Invoice />,
  play: async ({ canvas }) => {
    const overview = canvas.getByRole("tab", { name: "Overview" });
    const activity = canvas.getByRole("tab", { name: "Activity" });

    await expect(overview).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Amount due");
    await expect(getComputedStyle(overview).backgroundColor).toBe("rgb(255, 255, 255)");

    await userEvent.click(activity);

    await waitFor(() =>
      expect(canvas.getByRole("tabpanel")).toHaveTextContent("Sent to Acme Inc."),
    );

    await userEvent.keyboard("{ArrowRight}");

    await expect(canvas.getByRole("tab", { name: "Settings" })).toHaveFocus();
    await expect(activity).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowRight}{Enter}");

    await expect(overview).toHaveFocus();
    await expect(overview).toHaveAttribute("aria-selected", "true");
  },
});

export const Vertical = meta.story({
  render: () => <Invoice orientation="vertical" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
  },
});

import { expect, fn, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Field from "../field/field";
import * as Select from "./select";

const meta = preview.meta({
  title: "Components/Select",
  parameters: { figma: {}, a11y: { context: "body" } },
});

const PLANS = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

const changed = fn();

function Plan({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Field.Root>
      <Field.Label>Plan</Field.Label>
      <Select.Root items={PLANS} defaultOpen={defaultOpen} onValueChange={changed}>
        <Select.Trigger>
          <Select.Value placeholder="Choose a plan" />
        </Select.Trigger>
        <Select.Content>
          {PLANS.map((plan) => (
            <Select.Item key={plan.value} value={plan.value}>
              {plan.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Field.Root>
  );
}

/** Choosing an option shows its label in the trigger and reports its value. */
export const Default = meta.story({
  render: () => <Plan />,
  play: async ({ canvas }) => {
    changed.mockClear();
    const trigger = canvas.getByRole("combobox", { name: "Plan" });

    await expect(trigger).toHaveTextContent("Choose a plan");

    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("option", { name: "Pro" }));

    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    await expect(trigger).toHaveTextContent("Pro");
    await expect(changed).toHaveBeenLastCalledWith("pro", expect.anything());
  },
});

/** The keyboard opens the list, moves through options, and selects with Enter. */
export const Keyboard = meta.story({
  render: () => <Plan />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("combobox", { name: "Plan" });

    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(document.activeElement).toHaveAttribute("role", "option"));
    const first = document.activeElement?.textContent;

    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(document.activeElement?.textContent).not.toBe(first));
    const chosen = document.activeElement?.textContent ?? "";

    await userEvent.keyboard("{Enter}");

    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    await expect(trigger).toHaveTextContent(chosen);
  },
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <Plan defaultOpen />,
  play: async () => {
    const list = await screen.findByRole("listbox");
    const popup = list.closest<HTMLElement>("[data-slot=select-content]");

    await expect(getComputedStyle(popup!).backgroundColor).toBe("rgb(23, 23, 23)");
  },
});

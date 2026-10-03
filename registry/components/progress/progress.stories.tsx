import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import { Progress } from "./progress";

const meta = preview.meta({
  title: "Components/Progress",
  component: Progress,
  decorators: [(Story) => <div style={{ width: 320 }}>{Story()}</div>],
  parameters: { figma: {} },
});

export const Default = meta.story({
  args: { label: "Uploading receipts", showValue: true, value: 40 },
  play: async ({ canvas }) => {
    const bar = canvas.getByRole("progressbar", { name: "Uploading receipts" });

    await expect(bar).toHaveAttribute("aria-valuenow", "40");
    await expect(canvas.getByText("40%")).toBeVisible();
  },
});

/** `value={null}` means the amount is unknown; no value is announced. */
export const Indeterminate = meta.story({
  args: { "aria-label": "Loading invoices", value: null },
  play: async ({ canvas }) => {
    const bar = canvas.getByRole("progressbar", { name: "Loading invoices" });

    await expect(bar).not.toHaveAttribute("aria-valuenow");
  },
});

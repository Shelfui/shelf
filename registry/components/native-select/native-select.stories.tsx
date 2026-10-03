import { expect, fn, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { Label } from "../label/label";
import * as NativeSelect from "./native-select";

const SIZES: NativeSelect.NativeSelectSize[] = ["sm", "default"];

const meta = preview.meta({
  title: "Components/NativeSelect",
  component: NativeSelect.Root,
  argTypes: {
    size: { control: "select", options: SIZES },
    disabled: { control: "boolean" },
  },
  parameters: { figma: {} },
});

const changed = fn();

function Status(props: NativeSelect.RootProps) {
  return (
    <NativeSelect.Root aria-label="Status" defaultValue="sent" {...props}>
      <NativeSelect.Option value="draft">Draft</NativeSelect.Option>
      <NativeSelect.Option value="sent">Sent</NativeSelect.Option>
      <NativeSelect.Option value="paid">Paid</NativeSelect.Option>
    </NativeSelect.Root>
  );
}

/** A real `<select>`: the keyboard changes the value and `onChange` fires. */
export const Default = meta.story({
  render: (args) => <Status {...args} onChange={(event) => changed(event.target.value)} />,
  play: async ({ canvas }) => {
    changed.mockClear();
    const select = canvas.getByRole("combobox", { name: "Status" });

    await expect(select).toHaveValue("sent");

    await userEvent.selectOptions(select, "paid");

    await expect(select).toHaveValue("paid");
    await expect(changed).toHaveBeenCalledWith("paid");
  },
});

/** Named by a visible label, with options in groups. */
export const Groups = meta.story({
  render: () => (
    <>
      <Label htmlFor="currency">Currency</Label>
      <NativeSelect.Root id="currency" defaultValue="eur">
        <NativeSelect.OptGroup label="Americas">
          <NativeSelect.Option value="usd">US dollar</NativeSelect.Option>
          <NativeSelect.Option value="cad">Canadian dollar</NativeSelect.Option>
        </NativeSelect.OptGroup>
        <NativeSelect.OptGroup label="Europe">
          <NativeSelect.Option value="eur">Euro</NativeSelect.Option>
          <NativeSelect.Option value="sek">Swedish krona</NativeSelect.Option>
        </NativeSelect.OptGroup>
      </NativeSelect.Root>
    </>
  ),
  play: async ({ canvas }) => {
    const select = canvas.getByRole("combobox", { name: "Currency" });

    await expect(canvas.getAllByRole("group")).toHaveLength(2);
    await expect(select).toHaveDisplayValue("Euro");
  },
});

/** Heights match Input and Select: 1.75rem small, 2rem default. */
export const Sizes = meta.story({
  render: () => (
    <>
      <Status size="sm" aria-label="Small" />
      <Status aria-label="Default" />
    </>
  ),
  play: async ({ canvas }) => {
    const height = (name: string) => canvas.getByRole("combobox", { name }).offsetHeight;

    await expect(height("Small")).toBe(28);
    await expect(height("Default")).toBe(32);
  },
});

export const Invalid = meta.story({
  render: () => <Status aria-invalid />,
  play: async ({ canvas }) => {
    const select = canvas.getByRole("combobox", { name: "Status" });

    await expect(getComputedStyle(select).borderTopColor).toBe("oklch(0.577 0.245 27.3)");
  },
});

export const Disabled = meta.story({
  render: () => <Status disabled />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("combobox", { name: "Status" })).toBeDisabled();
  },
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <Status />,
  play: async ({ canvas }) => {
    const select = canvas.getByRole("combobox", { name: "Status" });

    await expect(getComputedStyle(select).color).toBe("rgb(237, 237, 237)");
    await expect(getComputedStyle(select).borderTopColor).toBe("rgb(51, 51, 51)");
  },
});

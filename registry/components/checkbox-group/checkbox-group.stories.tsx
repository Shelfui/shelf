import { useState } from "react";
import { expect, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { Checkbox } from "../checkbox/checkbox";
import { Label } from "../label/label";
import { CheckboxGroup } from "./checkbox-group";

const meta = preview.meta({
  title: "Components/Checkbox Group",
  component: CheckboxGroup,
  parameters: { figma: {} },
});

const PERMISSIONS = ["read", "write", "delete"];

export const Default = meta.story({
  render: () => (
    <CheckboxGroup aria-label="Notifications" defaultValue={["email"]}>
      <Label>
        <Checkbox value="email" /> Email
      </Label>
      <Label>
        <Checkbox value="sms" /> SMS
      </Label>
      <Label>
        <Checkbox value="push" /> Push
      </Label>
    </CheckboxGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("checkbox", { name: "Email" })).toBeChecked();

    await userEvent.click(canvas.getByRole("checkbox", { name: "SMS" }));

    await expect(canvas.getByRole("checkbox", { name: "SMS" })).toBeChecked();
    await expect(canvas.getByRole("checkbox", { name: "Email" })).toBeChecked();
  },
});

function SelectAll() {
  const [value, setValue] = useState<string[]>(["read"]);

  return (
    <CheckboxGroup
      aria-label="Permissions"
      value={value}
      onValueChange={setValue}
      allValues={PERMISSIONS}
    >
      <Label>
        <Checkbox parent /> All permissions
      </Label>
      {PERMISSIONS.map((permission) => (
        <Label key={permission}>
          <Checkbox value={permission} /> {permission}
        </Label>
      ))}
    </CheckboxGroup>
  );
}

/** A `parent` checkbox checks or clears the whole group and is mixed when some are checked. */
export const WithSelectAll = meta.story({
  render: () => <SelectAll />,
  play: async ({ canvas }) => {
    const all = canvas.getByRole("checkbox", { name: "All permissions" });

    await expect(all).toHaveAttribute("aria-checked", "mixed");

    await userEvent.click(all);

    for (const permission of PERMISSIONS) {
      await expect(canvas.getByRole("checkbox", { name: permission })).toBeChecked();
    }
    await expect(all).toBeChecked();
  },
});

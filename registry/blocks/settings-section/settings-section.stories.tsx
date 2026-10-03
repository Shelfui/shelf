import { expect, fn, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { SettingsSection } from "./settings-section";

const meta = preview.meta({
  title: "Blocks/Settings Section",
  component: SettingsSection,
  parameters: { figma: { fill: true } },
});

const saved = fn();

const profile = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  bio: "Writes programs for engines that don't exist yet.",
  notifications: true,
};

/** Nothing has changed, so Save and Cancel are disabled. */
export const Default = meta.story({
  render: () => <SettingsSection defaultValues={profile} onSave={saved} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Profile" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Save" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Cancel" })).toBeDisabled();
    await expect(canvas.getByRole("switch", { name: "Email notifications" })).toBeChecked();
  },
});

/** Editing enables Save and Cancel. Cancel restores the saved values; Save reports the new ones. */
export const Dirty = meta.story({
  render: () => <SettingsSection defaultValues={profile} onSave={saved} />,
  play: async ({ canvas }) => {
    saved.mockClear();
    const name = () => canvas.getByRole("textbox", { name: "Name" });

    await userEvent.clear(name());
    await userEvent.type(name(), "Grace Hopper");
    await expect(canvas.getByRole("button", { name: "Save" })).toBeEnabled();

    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(name()).toHaveValue("Ada Lovelace"));
    await expect(canvas.getByRole("button", { name: "Save" })).toBeDisabled();

    await userEvent.click(canvas.getByRole("switch", { name: "Email notifications" }));
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(saved).toHaveBeenCalledWith({ ...profile, notifications: false }));
    await expect(canvas.getByRole("switch", { name: "Email notifications" })).not.toBeChecked();
  },
});

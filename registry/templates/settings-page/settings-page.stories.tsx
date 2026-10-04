import { expect, fn, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { SettingsPage } from "./settings-page";

const meta = preview.meta({
  title: "Templates/Settings Page",
  component: SettingsPage,
  // The confirmation dialog renders in a portal on <body>.
  parameters: { layout: "fullscreen", a11y: { context: "body" } },
});

const profile = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  bio: "Writes programs for engines that don't exist yet.",
  notifications: true,
};

const saved = fn();
const deleted = fn();

/** The page names itself, then each section, and the profile can be saved. */
export const Default = meta.story({
  args: { profile, onSaveProfile: saved, onDeleteAccount: deleted },
  play: async ({ canvas }) => {
    saved.mockClear();
    await expect(canvas.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
    await expect(canvas.getByRole("heading", { level: 2, name: "Profile" })).toBeVisible();
    await expect(canvas.getByRole("heading", { level: 2, name: "Delete account" })).toBeVisible();

    const name = canvas.getByRole("textbox", { name: "Name" });
    await userEvent.clear(name);
    await userEvent.type(name, "Grace Hopper");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(saved).toHaveBeenCalledWith({ ...profile, name: "Grace Hopper" }));
  },
});

/** Deleting the account asks first, and runs only after the person confirms. */
export const DeleteAccount = meta.story({
  args: { profile, onSaveProfile: saved, onDeleteAccount: deleted },
  play: async ({ canvas }) => {
    deleted.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: "Delete account" }));
    await screen.findByRole("alertdialog", { name: "Delete your account?" });
    await expect(deleted).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Delete account" }));
    await waitFor(() => expect(deleted).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  },
});

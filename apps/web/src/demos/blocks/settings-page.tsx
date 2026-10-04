"use client";

import { SettingsPage } from "@/components/templates/settings-page";

export default function SettingsPageDemo() {
  return (
    <SettingsPage
      profile={{
        name: "Ada Lovelace",
        email: "ada@example.com",
        bio: "Writes programs for engines that don't exist yet.",
        notifications: true,
      }}
      onSaveProfile={() => {}}
      onDeleteAccount={async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }}
    />
  );
}

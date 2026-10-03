"use client";

import { SettingsSection } from "@/components/blocks/settings-section";

export default function SettingsSectionDemo() {
  return (
    <SettingsSection
      defaultValues={{
        name: "Ada Lovelace",
        email: "ada@example.com",
        bio: "Writes programs for engines that don't exist yet.",
        notifications: true,
      }}
      onSave={() => {}}
    />
  );
}

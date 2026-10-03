import * as stylex from "@stylexjs/stylex";
import * as Tabs from "@/components/ui/tabs";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";

export default function TabsVertical() {
  return (
    <Tabs.Root defaultValue="general" orientation="vertical" style={styles.root}>
      <Tabs.List>
        <Tabs.Tab value="general">General</Tabs.Tab>
        <Tabs.Tab value="billing">Billing</Tabs.Tab>
        <Tabs.Tab value="members">Members</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="general" style={styles.panel}>
        Workspace name, time zone and default currency.
      </Tabs.Panel>
      <Tabs.Panel value="billing" style={styles.panel}>
        Plan, payment method and invoices from us.
      </Tabs.Panel>
      <Tabs.Panel value="members" style={styles.panel}>
        Invite people and choose what they can see.
      </Tabs.Panel>
    </Tabs.Root>
  );
}

const styles = stylex.create({
  root: { maxWidth: "28rem", width: "100%" },
  panel: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    paddingInline: spacing["4"],
  },
});

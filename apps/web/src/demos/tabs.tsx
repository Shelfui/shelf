import * as stylex from "@stylexjs/stylex";
import * as Tabs from "@/components/ui/tabs";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";

export default function TabsDemo() {
  return (
    <Tabs.Root defaultValue="overview" style={styles.root}>
      <Tabs.List>
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="activity">Activity</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview" style={styles.panel}>
        $48,200.00 paid across 12 invoices this quarter.
      </Tabs.Panel>
      <Tabs.Panel value="activity" style={styles.panel}>
        Acme Inc. paid INV-1042 two hours ago.
      </Tabs.Panel>
      <Tabs.Panel value="settings" style={styles.panel}>
        Invoices are sent at 9:00 in your workspace time zone.
      </Tabs.Panel>
    </Tabs.Root>
  );
}

const styles = stylex.create({
  root: { maxWidth: "24rem", width: "100%" },
  panel: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    paddingBlock: spacing["4"],
  },
});

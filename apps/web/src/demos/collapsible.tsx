import * as stylex from "@stylexjs/stylex";
import { Button } from "@/components/ui/button";
import * as Collapsible from "@/components/ui/collapsible";
import { ChevronsUpDownIcon } from "@/components/ui/icons";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";

export default function CollapsibleDemo() {
  return (
    <Collapsible.Root style={styles.root}>
      <div {...stylex.props(styles.header)}>
        <span {...stylex.props(styles.title)}>3 unpaid invoices</span>
        <Collapsible.Trigger render={<Button variant="ghost" size="icon-sm" />} aria-label="Toggle">
          <ChevronsUpDownIcon />
        </Collapsible.Trigger>
      </div>
      <div {...stylex.props(styles.row)}>INV-1042 · Acme Inc.</div>
      <Collapsible.Panel style={styles.panel}>
        <div {...stylex.props(styles.row)}>INV-1043 · Globex</div>
        <div {...stylex.props(styles.row)}>INV-1044 · Initech</div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

const styles = stylex.create({
  root: { gap: spacing["2"], display: "grid", width: "18rem" },
  header: { alignItems: "center", display: "flex", justifyContent: "space-between" },
  title: { fontSize: typography.fontSizeSm, fontWeight: typography.fontWeightSemibold },
  panel: { gap: spacing["2"], display: "grid" },
  row: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeSm,
    paddingBlock: spacing["2"],
    paddingInline: spacing["4"],
  },
});

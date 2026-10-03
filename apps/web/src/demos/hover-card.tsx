import * as stylex from "@stylexjs/stylex";
import * as Avatar from "@/components/ui/avatar";
import * as HoverCard from "@/components/ui/hover-card";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";

export default function HoverCardDemo() {
  return (
    <HoverCard.Root>
      <HoverCard.Trigger href="#">Acme Inc.</HoverCard.Trigger>
      <HoverCard.Content>
        <div {...stylex.props(styles.row)}>
          <Avatar.Root>
            <Avatar.Fallback>AC</Avatar.Fallback>
          </Avatar.Root>
          <div {...stylex.props(styles.text)}>
            <strong {...stylex.props(styles.name)}>Acme Inc.</strong>
            <span {...stylex.props(styles.muted)}>Customer since March 2024</span>
            <span {...stylex.props(styles.muted)}>12 invoices · $48,200.00 paid</span>
          </div>
        </div>
      </HoverCard.Content>
    </HoverCard.Root>
  );
}

const styles = stylex.create({
  row: { gap: spacing["3"], display: "flex" },
  text: { gap: spacing["1"], display: "grid" },
  name: { fontSize: typography.fontSizeSm, fontWeight: typography.fontWeightSemibold },
  muted: { color: colors.mutedForeground, fontSize: typography.fontSizeXs },
});

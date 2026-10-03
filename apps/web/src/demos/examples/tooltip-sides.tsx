import * as stylex from "@stylexjs/stylex";
import { Button } from "@/components/ui/button";
import * as Tooltip from "@/components/ui/tooltip";
import { spacing } from "@/styles/shelf/tokens.stylex";

const SIDES = ["top", "right", "bottom", "left"] as const;

export default function TooltipSides() {
  return (
    <div {...stylex.props(styles.row)}>
      {SIDES.map((side) => (
        <Tooltip.Root key={side}>
          <Tooltip.Trigger render={<Button variant="outline" style={styles.label} />}>
            {side}
          </Tooltip.Trigger>
          <Tooltip.Content side={side}>Shown on the {side}</Tooltip.Content>
        </Tooltip.Root>
      ))}
    </div>
  );
}

const styles = stylex.create({
  label: { textTransform: "capitalize" },
  row: { gap: spacing["2"], display: "flex", flexWrap: "wrap", justifyContent: "center" },
});

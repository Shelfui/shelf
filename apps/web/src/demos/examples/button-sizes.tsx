import * as stylex from "@stylexjs/stylex";
import { Button } from "@/components/ui/button";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function ButtonSizes() {
  return (
    <div {...stylex.props(styles.row)}>
      <Button variant="outline" size="xs">
        Extra small
      </Button>
      <Button variant="outline" size="sm">
        Small
      </Button>
      <Button variant="outline">Default</Button>
      <Button variant="outline" size="lg">
        Large
      </Button>
    </div>
  );
}

const styles = stylex.create({
  row: {
    gap: spacing["2"],
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
  },
});

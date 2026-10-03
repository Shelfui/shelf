import * as stylex from "@stylexjs/stylex";
import { Button } from "@/components/ui/button";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function ButtonDemo() {
  return (
    <div {...stylex.props(styles.row)}>
      <Button>Button</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
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

import * as stylex from "@stylexjs/stylex";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function SpinnerDemo() {
  return (
    <div {...stylex.props(styles.row)}>
      <Spinner />
      <Button disabled>
        <Spinner /> Saving
      </Button>
    </div>
  );
}

const styles = stylex.create({
  row: { gap: spacing["4"], alignItems: "center", display: "flex" },
});

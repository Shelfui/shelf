import * as stylex from "@stylexjs/stylex";
import { Button } from "@/components/ui/button";
import { ArrowUpRightIcon, PlusIcon, SendIcon } from "@/components/ui/icons";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function ButtonWithIcon() {
  return (
    <div {...stylex.props(styles.row)}>
      <Button>
        <SendIcon /> Send invoice
      </Button>
      <Button variant="outline">
        Open <ArrowUpRightIcon />
      </Button>
      <Button variant="outline" size="icon-sm" aria-label="Add">
        <PlusIcon />
      </Button>
      <Button variant="outline" size="icon" aria-label="Add">
        <PlusIcon />
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

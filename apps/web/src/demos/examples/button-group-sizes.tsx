import * as stylex from "@stylexjs/stylex";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function ButtonGroupSizes() {
  return (
    <div {...stylex.props(styles.stack)}>
      <ButtonGroup aria-label="Zoom, small">
        <Button variant="outline" size="sm">
          50%
        </Button>
        <Button variant="outline" size="sm">
          100%
        </Button>
        <Button variant="outline" size="sm">
          200%
        </Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Zoom">
        <Button variant="outline">50%</Button>
        <Button variant="outline">100%</Button>
        <Button variant="outline">200%</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Zoom, large">
        <Button variant="outline" size="lg">
          50%
        </Button>
        <Button variant="outline" size="lg">
          100%
        </Button>
        <Button variant="outline" size="lg">
          200%
        </Button>
      </ButtonGroup>
    </div>
  );
}

const styles = stylex.create({
  stack: { gap: spacing["4"], alignItems: "center", display: "grid", justifyItems: "center" },
});

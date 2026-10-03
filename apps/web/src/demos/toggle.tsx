import * as stylex from "@stylexjs/stylex";
import { BoldIcon, ItalicIcon } from "@/components/ui/icons";
import { Toggle } from "@/components/ui/toggle";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function ToggleDemo() {
  return (
    <div {...stylex.props(styles.row)}>
      <Toggle aria-label="Bold" defaultPressed>
        <BoldIcon />
      </Toggle>
      <Toggle variant="outline" aria-label="Italic">
        <ItalicIcon />
      </Toggle>
    </div>
  );
}

const styles = stylex.create({
  row: { gap: spacing["2"], display: "flex" },
});

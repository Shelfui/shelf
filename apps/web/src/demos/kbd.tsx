import * as stylex from "@stylexjs/stylex";
import { Kbd } from "@/components/ui/kbd";
import { colors, typography } from "@/styles/shelf/tokens.stylex";

export default function KbdDemo() {
  return (
    <p {...stylex.props(styles.text)}>
      Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search, or <Kbd>Esc</Kbd> to close.
    </p>
  );
}

const styles = stylex.create({
  text: { color: colors.mutedForeground, fontSize: typography.fontSizeSm, margin: 0 },
});

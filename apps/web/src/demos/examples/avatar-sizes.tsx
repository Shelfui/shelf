import * as stylex from "@stylexjs/stylex";
import * as Avatar from "@/components/ui/avatar";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function AvatarSizes() {
  return (
    <div {...stylex.props(styles.row)}>
      <Avatar.Root size="sm">
        <Avatar.Fallback>AL</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root>
        <Avatar.Fallback>AL</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="lg">
        <Avatar.Fallback>AL</Avatar.Fallback>
      </Avatar.Root>
    </div>
  );
}

const styles = stylex.create({
  row: { gap: spacing["4"], alignItems: "center", display: "flex" },
});

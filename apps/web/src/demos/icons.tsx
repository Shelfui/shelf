import * as stylex from "@stylexjs/stylex";
import * as Icons from "@/components/ui/icons";
import { spacing } from "@/styles/shelf/tokens.stylex";

const ICONS = Object.entries(Icons).filter(
  (entry): entry is [string, (props: Icons.IconProps) => React.JSX.Element] =>
    typeof entry[1] === "function",
);

export default function IconsDemo() {
  return (
    <div {...stylex.props(styles.grid)}>
      {ICONS.map(([name, Icon]) => (
        <Icon key={name} aria-label={name.replace(/Icon$/, "")} aria-hidden={false} role="img" />
      ))}
    </div>
  );
}

const styles = stylex.create({
  grid: {
    gap: spacing["4"],
    display: "grid",
    fontSize: "1.25rem",
    gridTemplateColumns: "repeat(7, 1.25rem)",
  },
});

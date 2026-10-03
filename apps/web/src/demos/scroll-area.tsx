import * as stylex from "@stylexjs/stylex";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";

const RELEASES = Array.from({ length: 30 }, (_, index) => `v1.${30 - index}.0`);

export default function ScrollAreaDemo() {
  return (
    <ScrollArea style={styles.area}>
      <div {...stylex.props(styles.content)}>
        <h4 {...stylex.props(styles.heading)}>Releases</h4>
        {RELEASES.map((release) => (
          <div key={release}>
            <div {...stylex.props(styles.item)}>{release}</div>
            <Separator />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

const styles = stylex.create({
  area: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    height: "18rem",
    width: "12rem",
  },
  content: { padding: spacing["4"] },
  heading: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    marginBottom: spacing["4"],
    marginTop: 0,
  },
  item: { fontSize: typography.fontSizeSm, paddingBlock: spacing["2"] },
});

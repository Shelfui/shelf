import * as stylex from "@stylexjs/stylex";
import * as ContextMenu from "@/components/ui/context-menu";
import { colors, radius, typography } from "@/styles/shelf/tokens.stylex";

export default function ContextMenuDemo() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger style={styles.area}>Right-click here</ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item>
          Back <ContextMenu.Shortcut>⌘[</ContextMenu.Shortcut>
        </ContextMenu.Item>
        <ContextMenu.Item>
          Reload <ContextMenu.Shortcut>⌘R</ContextMenu.Shortcut>
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.CheckboxItem defaultChecked>Show bookmarks</ContextMenu.CheckboxItem>
        <ContextMenu.Separator />
        <ContextMenu.Item variant="destructive">Delete</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

const styles = stylex.create({
  area: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "dashed",
    borderWidth: 1,
    color: colors.mutedForeground,
    display: "flex",
    fontSize: typography.fontSizeSm,
    height: "9rem",
    justifyContent: "center",
    width: "18rem",
  },
});

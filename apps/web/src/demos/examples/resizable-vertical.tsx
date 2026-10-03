import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import * as Resizable from "@/components/ui/resizable";
import { colors, radius, typography } from "@/styles/shelf/tokens.stylex";

export default function ResizableVertical() {
  return (
    <div {...stylex.props(styles.frame)}>
      <Resizable.Group orientation="vertical">
        <Resizable.Panel defaultSize="30" minSize="20">
          <Label>Header</Label>
        </Resizable.Panel>
        <Resizable.Handle aria-label="Resize header" />
        <Resizable.Panel minSize="30">
          <Label>Content</Label>
        </Resizable.Panel>
      </Resizable.Group>
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <div {...stylex.props(styles.label)}>{children}</div>;
}

const styles = stylex.create({
  frame: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
    height: "14rem",
    maxWidth: "24rem",
    width: "100%",
  },
  label: {
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    justifyContent: "center",
    height: "100%",
  },
});

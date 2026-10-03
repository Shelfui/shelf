import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import * as Resizable from "@/components/ui/resizable";
import { colors, radius, typography } from "@/styles/shelf/tokens.stylex";

export default function ResizableNested() {
  return (
    <div {...stylex.props(styles.frame)}>
      <Resizable.Group>
        <Resizable.Panel defaultSize="28" minSize="15">
          <Label>Sidebar</Label>
        </Resizable.Panel>
        <Resizable.Handle withHandle aria-label="Resize sidebar" />
        <Resizable.Panel>
          <Resizable.Group orientation="vertical">
            <Resizable.Panel defaultSize="70" minSize="25">
              <Label>Content</Label>
            </Resizable.Panel>
            <Resizable.Handle withHandle aria-label="Resize bottom panel" />
            <Resizable.Panel minSize="15">
              <Label>Terminal</Label>
            </Resizable.Panel>
          </Resizable.Group>
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
    height: "20rem",
    maxWidth: "36rem",
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

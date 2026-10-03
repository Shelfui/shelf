"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as Drawer from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";

export default function DrawerDemo() {
  const [minutes, setMinutes] = useState(45);

  return (
    <Drawer.Root>
      <Drawer.Trigger render={<Button variant="outline" />}>Set a goal</Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Daily move goal</Drawer.Title>
          <Drawer.Description>Set how many active minutes you aim for each day.</Drawer.Description>
        </Drawer.Header>
        <div {...stylex.props(styles.goal)}>
          <span {...stylex.props(styles.value)}>{minutes}</span>
          <span {...stylex.props(styles.unit)}>minutes per day</span>
        </div>
        <Slider
          aria-label="Active minutes"
          value={minutes}
          onValueChange={(value) => typeof value === "number" && setMinutes(value)}
          max={120}
          step={5}
        />
        <Drawer.Footer>
          <Drawer.Close render={<Button />}>Save goal</Drawer.Close>
          <Drawer.Close render={<Button variant="outline" />}>Cancel</Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Root>
  );
}

const styles = stylex.create({
  goal: {
    gap: spacing["1"],
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    paddingBlock: spacing["4"],
  },
  value: {
    fontSize: "3.5rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: "-0.03em",
    lineHeight: 1,
  },
  unit: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeXs,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
});

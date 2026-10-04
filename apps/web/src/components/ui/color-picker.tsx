"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, useState } from "react";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";
import { CheckIcon } from "./icons";
import { Input } from "./input";

export interface Swatch {
  /** A hex color such as "#ef4444". */
  value: string;
  /** What screen readers hear. */
  label: string;
}

export const DEFAULT_SWATCHES: Swatch[] = [
  { value: "#171717", label: "Black" },
  { value: "#737373", label: "Gray" },
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#22c55e", label: "Green" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#a855f7", label: "Purple" },
];

export interface ColorPickerProps extends Styled<
  Omit<ComponentProps<"div">, "defaultValue" | "onChange" | "role">
> {
  /** A hex color, "#rrggbb". */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  swatches?: Swatch[];
  disabled?: boolean;
  /** Names the group, such as "Accent color". */
  "aria-label": string;
}

/** "#abc" and "#aabbcc" are colors; the result is always "#aabbcc" in lowercase. */
export function normalizeHex(text: string): string | undefined {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text.trim());
  if (!match) return undefined;
  const digits = match[1]!.toLowerCase();
  const full = digits.length === 3 ? digits.replace(/./g, "$&$&") : digits;
  return `#${full}`;
}

/**
 * Swatches to pick from and a hex field for anything else. Values are hex strings, so the
 * result works anywhere a CSS color does.
 *
 *   <ColorPicker aria-label="Accent color" value={color} onValueChange={setColor} />
 */
export function ColorPicker({
  value,
  defaultValue = DEFAULT_SWATCHES[0]!.value,
  onValueChange,
  swatches = DEFAULT_SWATCHES,
  disabled,
  style,
  ...props
}: ColorPickerProps) {
  const [inner, setInner] = useState(defaultValue);
  const [draft, setDraft] = useState<string>();
  const current = value ?? inner;

  const choose = (next: string) => {
    setInner(next);
    onValueChange?.(next);
  };

  return (
    <div data-slot="color-picker" role="group" {...props} {...stylex.props(styles.root, style)}>
      <RadioGroup
        value={current}
        disabled={disabled}
        onValueChange={(next) => {
          setDraft(undefined);
          choose(next);
        }}
        aria-label="Swatches"
        {...stylex.props(styles.swatches)}
      >
        {swatches.map((swatch) => (
          <Radio.Root
            key={swatch.value}
            value={swatch.value}
            aria-label={swatch.label}
            {...stylex.props(styles.swatch, styles.color(swatch.value))}
          >
            <Radio.Indicator {...stylex.props(styles.check)}>
              <CheckIcon />
            </Radio.Indicator>
          </Radio.Root>
        ))}
      </RadioGroup>
      <div {...stylex.props(styles.hex)}>
        <span aria-hidden {...stylex.props(styles.preview, styles.color(current))} />
        <Input
          aria-label="Hex color"
          spellCheck={false}
          disabled={disabled}
          value={draft ?? current}
          onChange={(event) => {
            setDraft(event.target.value);
            const hex = normalizeHex(event.target.value);
            if (hex) choose(hex);
          }}
          onBlur={() => setDraft(undefined)}
          aria-invalid={draft !== undefined && !normalizeHex(draft) ? true : undefined}
          style={styles.input}
        />
      </div>
    </div>
  );
}

const styles = stylex.create({
  root: {
    gap: spacing["3"],
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
  },
  swatches: {
    gap: spacing["2"],
    display: "flex",
    flexWrap: "wrap",
  },
  swatch: {
    margin: 0,
    padding: 0,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${colors.ring}`,
    },
    alignItems: "center",
    boxSizing: "border-box",
    cursor: "default",
    display: "flex",
    justifyContent: "center",
    outlineOffset: 2,
    height: "1.5rem",
    width: "1.5rem",
  },
  color: (color: string) => ({
    backgroundColor: color,
  }),
  check: {
    // White on dark swatches, a drop shadow keeps it visible on light ones.
    color: "#ffffff",
    display: "flex",
    filter: "drop-shadow(0 0 1px rgb(0 0 0 / 0.7))",
    fontSize: "0.875rem",
  },
  hex: {
    gap: spacing["2"],
    alignItems: "center",
    display: "flex",
  },
  preview: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    boxSizing: "border-box",
    flexShrink: 0,
    height: "2rem",
    width: "2rem",
  },
  input: {
    fontFamily: typography.fontFamilyMono,
    width: "8rem",
  },
});

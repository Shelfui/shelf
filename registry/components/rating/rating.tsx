"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, useState } from "react";
import { colors, radius, spacing } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";
import { StarIcon } from "../icons/icons";

export interface RatingProps extends Styled<
  Omit<ComponentProps<"div">, "defaultValue" | "onChange" | "role">
> {
  /** Stars filled, from 0 to `max`. */
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  max?: number;
  /** Shows the value without letting the user change it. */
  readOnly?: boolean;
  disabled?: boolean;
  /** Names the control, such as "Rate this answer". */
  "aria-label": string;
}

/**
 * Stars the user can pick, as a radio group: arrow keys change the rating and screen readers
 * hear "3 stars". Set `readOnly` to display an average.
 *
 *   <Rating aria-label="Rate this answer" onValueChange={save} />
 */
export function Rating({
  value,
  defaultValue = 0,
  onValueChange,
  max = 5,
  readOnly = false,
  disabled = false,
  style,
  ...props
}: RatingProps) {
  const [inner, setInner] = useState(defaultValue);
  const [hover, setHover] = useState<number>();
  const current = value ?? inner;
  const shown = hover ?? current;
  const stars = Array.from({ length: max }, (_, index) => index + 1);

  if (readOnly) {
    return (
      <div
        data-slot="rating"
        role="img"
        {...props}
        aria-label={`${props["aria-label"]}: ${current} out of ${max}`}
        {...stylex.props(styles.root, style)}
      >
        {stars.map((star) => (
          <StarIcon
            key={star}
            {...stylex.props(styles.star)}
            fill={star <= current ? "currentColor" : "none"}
          />
        ))}
      </div>
    );
  }

  return (
    <RadioGroup
      data-slot="rating"
      value={current === 0 ? null : current}
      disabled={disabled}
      onValueChange={(next) => {
        const star = Number(next);
        setInner(star);
        onValueChange?.(star);
      }}
      onMouseLeave={() => setHover(undefined)}
      {...props}
      {...stylex.props(styles.root, style)}
    >
      {stars.map((star) => (
        <Radio.Root
          key={star}
          value={star}
          aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
          onMouseEnter={() => setHover(star)}
          className={(state) =>
            stylex.props(styles.item, state.disabled && styles.disabled).className
          }
        >
          <StarIcon fill={star <= shown ? "currentColor" : "none"} />
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}

const styles = stylex.create({
  root: {
    gap: spacing["1"],
    alignItems: "center",
    color: colors.foreground,
    display: "inline-flex",
  },
  item: {
    margin: 0,
    padding: spacing["1"],
    borderRadius: radius.sm,
    borderWidth: 0,
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${colors.ring}`,
    },
    backgroundColor: "transparent",
    color: "inherit",
    cursor: "default",
    display: "inline-flex",
    fontSize: "1.25rem",
  },
  disabled: {
    opacity: 0.5,
  },
  star: {
    fontSize: "1.25rem",
  },
});

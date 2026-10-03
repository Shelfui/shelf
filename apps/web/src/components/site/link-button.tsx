"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import type { ComponentProps } from "react";
import { type ButtonSize, type ButtonVariant, buttonStyles } from "@/components/ui/button";

/** A link that looks like a Button. It stays a link, so it keeps link semantics. */
export function LinkButton({
  variant,
  size,
  style,
  ...props
}: Omit<ComponentProps<typeof Link>, "style" | "className"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: stylex.StaticStyles;
}) {
  return <Link {...props} {...stylex.props(buttonStyles(variant, size), style)} />;
}

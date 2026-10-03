import * as stylex from "@stylexjs/stylex";
import { ChevronRightIcon } from "lucide-react";
import type { ButtonVariant } from "@/components/ui/button";
import { typography } from "@/styles/shelf/tokens.stylex";
import { LinkButton } from "./link-button";

/** The site's pill call to action. `lg` is for page sections; the header uses the default. */
export function GetStarted({
  href = "/docs",
  label = "Get started",
  variant,
  size = "default",
  style,
}: {
  href?: string;
  label?: string;
  variant?: ButtonVariant;
  size?: "default" | "lg";
  style?: stylex.StaticStyles;
}) {
  return (
    <LinkButton
      href={href}
      variant={variant}
      style={[styles.pill, size === "lg" && styles.lg, style]}
    >
      {label}
      <ChevronRightIcon />
    </LinkButton>
  );
}

const styles = stylex.create({
  pill: {
    borderRadius: "999px",
    fontSize: typography.fontSizeSm,
    fontWeight: 550,
    gap: "0.5rem",
    height: "2.5rem",
    paddingInline: "1.25rem",
  },
  lg: {
    height: "3rem",
  },
});

"use client";

import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { layers, media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { type Styled, isTransitioning } from "@/lib/shelf/utils";

/**
 * A modal that asks the user to confirm or cancel before continuing. Unlike a Dialog,
 * clicking outside does not close it; the user has to choose.
 *
 *   <AlertDialog.Root>
 *     <AlertDialog.Trigger render={<Button variant="destructive" />}>Delete</AlertDialog.Trigger>
 *     <AlertDialog.Content>
 *       <AlertDialog.Header>
 *         <AlertDialog.Title>Delete invoice?</AlertDialog.Title>
 *         <AlertDialog.Description>…</AlertDialog.Description>
 *       </AlertDialog.Header>
 *       <AlertDialog.Footer>
 *         <AlertDialog.Close render={<Button variant="outline" />}>Cancel</AlertDialog.Close>
 *         <AlertDialog.Close render={<Button variant="destructive" />}>Delete</AlertDialog.Close>
 *       </AlertDialog.Footer>
 *     </AlertDialog.Content>
 *   </AlertDialog.Root>
 */
export const Root = BaseAlertDialog.Root;
export const Trigger = BaseAlertDialog.Trigger;
export const Close = BaseAlertDialog.Close;

export function Content({ style, ...props }: Styled<ComponentProps<typeof BaseAlertDialog.Popup>>) {
  return (
    <BaseAlertDialog.Portal>
      <BaseAlertDialog.Backdrop
        data-slot="alert-dialog-backdrop"
        className={(state) =>
          stylex.props(styles.backdrop, isTransitioning(state) && styles.backdropHidden).className
        }
      />
      <BaseAlertDialog.Popup
        data-slot="alert-dialog-content"
        {...props}
        className={(state) =>
          stylex.props(styles.popup, isTransitioning(state) && styles.popupHidden, style).className
        }
      />
    </BaseAlertDialog.Portal>
  );
}

export function Header({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="alert-dialog-header" {...props} {...stylex.props(styles.header, style)} />;
}

export function Footer({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="alert-dialog-footer" {...props} {...stylex.props(styles.footer, style)} />;
}

export function Title({ style, ...props }: Styled<ComponentProps<typeof BaseAlertDialog.Title>>) {
  return (
    <BaseAlertDialog.Title
      data-slot="alert-dialog-title"
      {...props}
      {...stylex.props(styles.title, style)}
    />
  );
}

export function Description({
  style,
  ...props
}: Styled<ComponentProps<typeof BaseAlertDialog.Description>>) {
  return (
    <BaseAlertDialog.Description
      data-slot="alert-dialog-description"
      {...props}
      {...stylex.props(styles.description, style)}
    />
  );
}

const styles = stylex.create({
  backdrop: {
    inset: 0,
    backgroundColor: colors.overlay,
    position: "fixed",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "opacity",
    transitionTimingFunction: motion.easingStandard,
    zIndex: layers.overlay,
  },
  backdropHidden: {
    opacity: 0,
  },
  popup: {
    fontSynthesis: "none",
    padding: spacing["6"],
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    gap: spacing["4"],
    outline: "none",
    backgroundColor: colors.background,
    boxSizing: "border-box",
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    position: "fixed",
    transform: "translate(-50%, -50%)",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "opacity, transform",
    transitionTimingFunction: motion.easingStandard,
    zIndex: layers.overlay,
    left: "50%",
    maxHeight: "calc(100dvh - 2rem)",
    maxWidth: "28rem",
    overflowY: "auto",
    top: "50%",
    width: "calc(100% - 2rem)",
  },
  popupHidden: {
    opacity: 0,
    transform: "translate(-50%, -50%) scale(0.97)",
  },
  header: {
    gap: spacing["1.5"],
    display: "flex",
    flexDirection: "column",
  },
  footer: {
    gap: spacing["2"],
    display: "flex",
    flexWrap: "wrap-reverse",
    justifyContent: "flex-end",
  },
  title: {
    margin: 0,
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    lineHeight: typography.lineHeightLg,
  },
  description: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
});

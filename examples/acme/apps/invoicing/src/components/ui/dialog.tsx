"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { layers, media } from "../../styles/shelf/conditions.stylex";
import { colors, motion, radius, spacing, typography } from "../../styles/shelf/tokens.stylex";
import { Button } from "./button";
import { CloseIcon } from "./icons";
import { type Styled, isTransitioning } from "../../lib/shelf/utils";

/**
 * A modal window. Compose the parts:
 *
 *   <Dialog.Root>
 *     <Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>
 *     <Dialog.Content>
 *       <Dialog.Header>
 *         <Dialog.Title>…</Dialog.Title>
 *         <Dialog.Description>…</Dialog.Description>
 *       </Dialog.Header>
 *       <Dialog.Footer>
 *         <Dialog.Close render={<Button variant="outline" />}>Cancel</Dialog.Close>
 *       </Dialog.Footer>
 *     </Dialog.Content>
 *   </Dialog.Root>
 *
 * Every dialog needs a `Title`. Base UI handles focus, dismissal, and scroll locking.
 */
export const Root = BaseDialog.Root;
export const Trigger = BaseDialog.Trigger;
export const Close = BaseDialog.Close;

export type ContentProps = Styled<ComponentProps<typeof BaseDialog.Popup>> & {
  /** Renders a close button in the corner. Keep one `Close` in the dialog if you turn it off. */
  showCloseButton?: boolean;
};

export function Content({ showCloseButton = true, style, children, ...props }: ContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop
        data-slot="dialog-backdrop"
        className={(state) =>
          stylex.props(styles.backdrop, isTransitioning(state) && styles.backdropHidden).className
        }
      />
      <BaseDialog.Popup
        data-slot="dialog-content"
        {...props}
        className={(state) =>
          stylex.props(styles.popup, isTransitioning(state) && styles.popupHidden, style).className
        }
      >
        {children}
        {showCloseButton && (
          <BaseDialog.Close
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Close" style={styles.close} />
            }
          >
            <CloseIcon />
          </BaseDialog.Close>
        )}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

export function Header({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="dialog-header" {...props} {...stylex.props(styles.header, style)} />;
}

export function Footer({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="dialog-footer" {...props} {...stylex.props(styles.footer, style)} />;
}

export function Title({ style, ...props }: Styled<ComponentProps<typeof BaseDialog.Title>>) {
  return (
    <BaseDialog.Title data-slot="dialog-title" {...props} {...stylex.props(styles.title, style)} />
  );
}

export function Description({
  style,
  ...props
}: Styled<ComponentProps<typeof BaseDialog.Description>>) {
  return (
    <BaseDialog.Description
      data-slot="dialog-description"
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
    maxWidth: "36rem",
    overflowY: "auto",
    top: "50%",
    width: "calc(100% - 2rem)",
  },
  popupHidden: {
    opacity: 0,
    transform: "translate(-50%, -50%) scale(0.97)",
  },
  close: {
    position: "absolute",
    right: spacing["4"],
    top: spacing["4"],
  },
  header: {
    gap: spacing["1.5"],
    display: "flex",
    flexDirection: "column",
    // Leaves room for the corner close button.
    paddingInlineEnd: spacing["6"],
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

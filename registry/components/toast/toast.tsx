"use client";

import { Toast as BaseToast } from "@base-ui/react/toast";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { layers, media } from "../../foundations/conditions.stylex";
import {
  colors,
  elevation,
  motion,
  radius,
  spacing,
  typography,
} from "../../foundations/tokens.stylex";
import { Button } from "../button/button";
import { CircleAlertIcon, CircleCheckIcon, CloseIcon } from "../icons/icons";
import { Spinner } from "../spinner/spinner";

/**
 * The app's toast queue. Call it from anywhere, including outside React:
 *
 *   toastManager.add({ title: "Invoice sent", description: "Acme Inc. will get it by email." });
 *   toastManager.add({ title: "Invoice sent", type: "success" });
 *   toastManager.add({ title: "Payment failed", type: "error" });
 *   toastManager.add({ title: "Invoice archived", actionProps: { children: "Undo", onClick: undo } });
 *   toastManager.promise(save(), {
 *     loading: "Saving…",
 *     success: "Saved",
 *     error: (error) => ({ title: "Couldn't save", description: String(error) }),
 *   });
 */
export const toastManager = BaseToast.createToastManager();

/** Reads and updates the queue from a component; `toastManager` does the same outside React. */
export const useToastManager = BaseToast.useToastManager;

export interface ToastProviderProps {
  children?: ReactNode;
  /** How long a toast stays, in milliseconds. `0` keeps it until dismissed. */
  timeout?: number;
  /** How many toasts show at once; older ones wait. */
  limit?: number;
}

/**
 * Renders the toasts in the bottom-right corner, stacked, and fanned out on hover or focus.
 * Base UI announces each toast to screen readers, pauses timers while the stack is open,
 * lets people swipe a toast away, and moves focus to the toasts on F6.
 */
export function ToastProvider({ children, timeout, limit }: ToastProviderProps) {
  return (
    <BaseToast.Provider toastManager={toastManager} timeout={timeout} limit={limit}>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport data-slot="toast-viewport" {...stylex.props(styles.viewport)}>
          <ToastList />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}

const icons: Record<string, ReactNode> = {
  success: <CircleCheckIcon />,
  error: <CircleAlertIcon />,
  loading: <Spinner aria-hidden />,
};

function ToastList() {
  const { toasts } = BaseToast.useToastManager();

  // Oldest first, so each newer toast paints over the ones behind it.
  return toasts.toReversed().map((toast) => {
    const icon = toast.type ? icons[toast.type] : undefined;
    return (
      <BaseToast.Root
        key={toast.id}
        toast={toast}
        swipeDirection={["down", "right"]}
        data-slot="toast"
        className={(state) =>
          stylex.props(
            styles.toast,
            state.expanded ? styles.expanded : styles.stacked,
            state.transitionStatus === "starting" && styles.entering,
            state.transitionStatus === "ending" && styles.leaving,
            state.transitionStatus === "ending" &&
              state.swipeDirection &&
              styles[state.swipeDirection],
            state.swiping && styles.swiping,
            state.limited && styles.limited,
          ).className
        }
      >
        <BaseToast.Content
          className={(state) =>
            stylex.props(styles.content, state.behind && !state.expanded && styles.behind).className
          }
        >
          {icon && (
            <span
              data-slot="toast-icon"
              {...stylex.props(styles.icon, toast.type === "error" && styles.error)}
            >
              {icon}
            </span>
          )}
          <div {...stylex.props(styles.text)}>
            <BaseToast.Title
              {...stylex.props(styles.title, toast.type === "error" && styles.error)}
            />
            <BaseToast.Description
              {...stylex.props(styles.description, !toast.title && styles.descriptionOnly)}
            />
          </div>
          {toast.actionProps && (
            <BaseToast.Action render={<Button variant="outline" size="sm" />} />
          )}
          <BaseToast.Close
            aria-label="Dismiss"
            render={<Button variant="ghost" size="icon-xs" style={styles.close} />}
          >
            <CloseIcon />
          </BaseToast.Close>
        </BaseToast.Content>
      </BaseToast.Root>
    );
  });
}

/** How far each toast behind the front one peeks out, and the gap once fanned out. */
const PEEK = "0.625rem";
const GAP = "0.75rem";
const SWIPE = "translateX(var(--toast-swipe-movement-x, 0px))";

const styles = stylex.create({
  viewport: {
    outline: "none",
    position: "fixed",
    zIndex: layers.toast,
    bottom: spacing["4"],
    right: spacing["4"],
    width: "min(22.5rem, calc(100vw - 2rem))",
  },
  toast: {
    fontSynthesis: "none",
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.popover,
    boxShadow: elevation.lg,
    boxSizing: "border-box",
    color: colors.popoverForeground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    position: "absolute",
    transformOrigin: "bottom center",
    transitionDuration: {
      default: `${motion.durationSlow}, ${motion.durationSlow}, ${motion.durationFast}`,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "transform, opacity, height",
    transitionTimingFunction: motion.easingOut,
    userSelect: "none",
    bottom: 0,
    right: 0,
    width: "100%",
    // Bridges the gap between fanned-out toasts, so moving between them keeps the stack open.
    "::after": {
      content: "''",
      position: "absolute",
      height: `calc(${GAP} + 1px)`,
      left: 0,
      top: "100%",
      width: "100%",
    },
  },
  stacked: {
    transform: `${SWIPE} translateY(calc(var(--toast-swipe-movement-y, 0px) - var(--toast-index) * ${PEEK})) scale(calc(1 - var(--toast-index) * 0.05))`,
    height: "var(--toast-frontmost-height, var(--toast-height))",
  },
  expanded: {
    transform: `${SWIPE} translateY(calc(var(--toast-swipe-movement-y, 0px) - var(--toast-offset-y) - var(--toast-index) * ${GAP}))`,
    height: "var(--toast-height)",
  },
  entering: {
    opacity: 0,
    transform: "translateY(150%)",
  },
  leaving: {
    opacity: 0,
  },
  down: {
    transform: "translateY(calc(var(--toast-swipe-movement-y, 0px) + 150%))",
  },
  up: {
    transform: "translateY(calc(var(--toast-swipe-movement-y, 0px) - 150%))",
  },
  right: {
    transform: "translateX(calc(var(--toast-swipe-movement-x, 0px) + 150%))",
  },
  left: {
    transform: "translateX(calc(var(--toast-swipe-movement-x, 0px) - 150%))",
  },
  swiping: {
    transitionDuration: "0s",
  },
  limited: {
    opacity: 0,
    pointerEvents: "none",
  },
  content: {
    padding: spacing["4"],
    gap: spacing["3"],
    overflow: "hidden",
    alignItems: "flex-start",
    display: "flex",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "opacity",
  },
  behind: {
    opacity: 0,
  },
  icon: {
    alignItems: "center",
    color: colors.popoverForeground,
    display: "flex",
    flexShrink: 0,
    fontSize: typography.fontSizeBase,
    height: typography.lineHeightSm,
  },
  text: {
    gap: spacing["1"],
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  title: {
    margin: 0,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightSm,
  },
  error: {
    color: colors.destructiveText,
  },
  description: {
    margin: 0,
    color: colors.mutedForeground,
  },
  // `toastManager.promise` puts plain-string messages in the description.
  descriptionOnly: {
    color: colors.popoverForeground,
  },
  close: {
    marginBlock: `calc(${spacing["1"]} * -1)`,
    marginInlineEnd: `calc(${spacing["1"]} * -1)`,
  },
});

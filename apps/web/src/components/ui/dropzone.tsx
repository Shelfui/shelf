"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, createContext, type ReactNode, use, useMemo, useState } from "react";
import { type Accept, type FileRejection, useDropzone } from "react-dropzone";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";
import { Button } from "./button";

export type { Accept, FileRejection };

interface State {
  /** A file is being dragged over this zone. */
  dragging: boolean;
  disabled: boolean;
  /** Files refused by the last drop or selection, with readable reasons. */
  rejections: readonly FileRejection[];
}

interface Actions {
  /** Opens the file picker. */
  open: () => void;
  clearRejections: () => void;
}

const StateContext = createContext<State | null>(null);
const ActionsContext = createContext<Actions | null>(null);

/** What the zone is doing. Re-renders when it changes. */
export function useDropzoneState<T>(select: (state: State) => T): T {
  const state = use(StateContext);
  if (!state) throw new Error("Dropzone parts must be used inside <Dropzone.Root>.");
  return select(state);
}

/** Stable actions for the zone. Never re-renders its caller. */
export function useDropzoneActions(): Actions {
  const actions = use(ActionsContext);
  if (!actions) throw new Error("Dropzone parts must be used inside <Dropzone.Root>.");
  return actions;
}

export interface RootProps extends Styled<Omit<ComponentProps<"div">, "children" | "onDrop">> {
  /** Called with the accepted files, from a drop, a paste into the picker, or the picker itself. */
  onFiles: (files: File[]) => void;
  /** Called with the files that were refused and why. They also appear in `Dropzone.Rejections`. */
  onReject?: (rejections: readonly FileRejection[]) => void;
  /** Allowed types, such as `{ "image/*": [] }` or `{ "application/pdf": [".pdf"] }`. Anything by default. */
  accept?: Accept;
  /** Largest file in bytes. */
  maxSize?: number;
  /** Most files at once. */
  maxFiles?: number;
  /** Allow several files at once. On by default. */
  multiple?: boolean;
  disabled?: boolean;
  /** Also accept files dropped anywhere on the page, which would otherwise navigate away. */
  children: ReactNode;
}

/**
 * A drop target for files. Wraps whatever it should cover; use `Dropzone.Overlay` to show the
 * drop hint, `Dropzone.Trigger` or `Dropzone.Area` to open the picker.
 *
 *   <Dropzone.Root accept={{ "image/*": [] }} maxSize={5_000_000} onFiles={add}>
 *     <Dropzone.Area>Drop images here</Dropzone.Area>
 *     <Dropzone.Rejections />
 *   </Dropzone.Root>
 *
 * Only drags that carry files react. Dropping a file outside any zone no longer navigates away.
 */
export function Root({
  onFiles,
  onReject,
  accept,
  maxSize,
  maxFiles,
  multiple = true,
  disabled = false,
  style,
  children,
  ...props
}: RootProps) {
  const [rejections, setRejections] = useState<readonly FileRejection[]>([]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept,
    maxSize,
    maxFiles,
    multiple,
    disabled,
    noClick: true,
    noKeyboard: true,
    // The nearest zone wins.
    noDragEventsBubbling: true,
    preventDropOnDocument: true,
    onDrop: (accepted, refused) => {
      setRejections(refused);
      if (refused.length > 0) onReject?.(refused);
      if (accepted.length > 0) onFiles(accepted);
    },
  });

  const state = useMemo<State>(
    () => ({ dragging: isDragActive, disabled, rejections }),
    [isDragActive, disabled, rejections],
  );
  const actions = useMemo<Actions>(
    () => ({ open, clearRejections: () => setRejections([]) }),
    [open],
  );

  return (
    <ActionsContext value={actions}>
      <StateContext value={state}>
        <div
          data-slot="dropzone"
          data-dragging={isDragActive || undefined}
          {...props}
          {...getRootProps()}
          {...stylex.props(styles.root, style)}
        >
          <input {...getInputProps()} />
          {children}
        </div>
      </StateContext>
    </ActionsContext>
  );
}

/** A button that opens the file picker. */
export function Trigger(props: ComponentProps<typeof Button>) {
  const { open } = useDropzoneActions();
  const disabled = useDropzoneState((s) => s.disabled);
  return <Button type="button" variant="outline" disabled={disabled} onClick={open} {...props} />;
}

/** A bordered region that shows the drop hint and opens the picker when pressed. */
export function Area({ style, children, ...props }: Styled<ComponentProps<"button">>) {
  const { open } = useDropzoneActions();
  const disabled = useDropzoneState((s) => s.disabled);
  return (
    <button
      type="button"
      data-slot="dropzone-area"
      disabled={disabled}
      onClick={open}
      {...props}
      {...stylex.props(styles.area, style)}
    >
      {children}
    </button>
  );
}

/** Covers the zone while a file is dragged over it. Put it last inside `Dropzone.Root`. */
export function Overlay({ style, children, ...props }: Styled<ComponentProps<"div">>) {
  const dragging = useDropzoneState((s) => s.dragging);
  if (!dragging) return null;
  return (
    <div data-slot="dropzone-overlay" {...props} {...stylex.props(styles.overlay, style)}>
      {children ?? "Drop files to upload"}
    </div>
  );
}

const MESSAGES: Record<string, string> = {
  "file-invalid-type": "isn't a supported type",
  "file-too-large": "is too large",
  "file-too-small": "is too small",
  "too-many-files": "was skipped: too many files",
};

/** Lists the files that were refused, announced to screen readers. Empty when there are none. */
export function Rejections({ style, ...props }: Styled<ComponentProps<"div">>) {
  const rejections = useDropzoneState((s) => s.rejections);
  return (
    // The live region stays mounted, so adding the first item is announced.
    <div role="alert" data-slot="dropzone-rejections" {...props}>
      {rejections.length > 0 ? (
        <ul {...stylex.props(styles.rejections, style)}>
          {rejections.map(({ file, errors }) => (
            <li key={`${file.name}:${file.size}:${file.lastModified}`}>
              {file.name} {MESSAGES[errors[0]?.code ?? ""] ?? errors[0]?.message ?? "was refused"}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

const styles = stylex.create({
  root: {
    position: "relative",
  },
  area: {
    padding: spacing["6"],
    borderColor: colors.input,
    borderRadius: radius.lg,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: spacing["2"],
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
    alignItems: "center",
    backgroundColor: { default: "transparent", ":hover": colors.muted },
    color: colors.mutedForeground,
    cursor: { default: "pointer", ":disabled": "not-allowed" },
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    justifyContent: "center",
    lineHeight: typography.lineHeightSm,
    opacity: { default: 1, ":disabled": 0.5 },
    outlineOffset: 2,
    transitionDuration: { default: "150ms", [media.reducedMotion]: "0s" },
    transitionProperty: "background-color",
    width: "100%",
  },
  overlay: {
    inset: 0,
    borderColor: colors.ring,
    borderRadius: radius.lg,
    borderStyle: "dashed",
    borderWidth: 2,
    alignItems: "center",
    backgroundColor: colors.overlay,
    color: colors.primaryForeground,
    display: "flex",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    justifyContent: "center",
    pointerEvents: "none",
    position: "absolute",
    zIndex: 10,
  },
  rejections: {
    margin: 0,
    listStyle: "none",
    paddingBlock: spacing["2"],
    paddingInline: 0,
    color: colors.destructiveText,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
});

"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, useEffect, useState } from "react";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";
import { Button } from "./button";
import { CloseIcon, FileIcon } from "./icons";

/**
 * A preview URL for a `File`, revoked when the file changes or the component unmounts.
 * `undefined` for anything that is not an image, so the chip shows an icon instead.
 */
export function useFileUrl(file: File | undefined): string | undefined {
  const [url, setUrl] = useState<string>();
  const isImage = file?.type.startsWith("image/") === true;
  useEffect(() => {
    if (!file || !isImage) return undefined;
    const next = URL.createObjectURL(file);
    // An object URL is an external resource: it exists only between this setup and its cleanup.
    // oxlint-disable-next-line react/set-state-in-effect
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file, isImage]);
  return isImage ? url : undefined;
}

export interface AttachmentProps extends Styled<Omit<ComponentProps<"div">, "children">> {
  name: string;
  /** An image URL for the thumbnail. Without one, a file icon shows. */
  previewUrl?: string;
  /** Shows a remove button. */
  onRemove?: () => void;
}

/**
 * A file chip: thumbnail or icon, a name that truncates, and an optional remove button.
 * For a `File` the person just chose, pass `useFileUrl(file)` as `previewUrl`.
 */
export function Attachment({ name, previewUrl, onRemove, style, ...props }: AttachmentProps) {
  return (
    <div data-slot="attachment" {...props} {...stylex.props(styles.root, style)}>
      {previewUrl ? (
        <img src={previewUrl} alt="" {...stylex.props(styles.thumb)} />
      ) : (
        <FileIcon {...stylex.props(styles.icon)} />
      )}
      <span {...stylex.props(styles.name)}>{name}</span>
      {onRemove ? (
        <Button variant="ghost" size="icon-xs" aria-label={`Remove ${name}`} onClick={onRemove}>
          <CloseIcon />
        </Button>
      ) : null}
    </div>
  );
}

const styles = stylex.create({
  root: {
    borderRadius: radius.md,
    gap: spacing["1.5"],
    paddingBlock: spacing["1"],
    alignItems: "center",
    backgroundColor: colors.muted,
    display: "inline-flex",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    paddingInlineEnd: spacing["1"],
    paddingInlineStart: spacing["1.5"],
    maxWidth: "16rem",
  },
  thumb: {
    borderRadius: radius.sm,
    objectFit: "cover",
    height: "1.5rem",
    width: "1.5rem",
  },
  icon: { color: colors.mutedForeground, flexShrink: 0 },
  name: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
});

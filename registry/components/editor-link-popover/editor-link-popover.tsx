"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { colors, spacing } from "../../foundations/tokens.stylex";
import { Button } from "../button/button";
import { useEditorInstance, useEditorState } from "../editor/editor";
import { ExternalLinkIcon, LinkIcon, UnlinkIcon } from "../icons/icons";
import { Input } from "../input/input";
import * as Popover from "../popover/popover";
import { Toggle } from "../toggle/toggle";
import * as Toolbar from "../toolbar/toolbar";

export interface EditorLinkPopoverProps {
  defaultOpen?: boolean;
  /** Called when the form opens or closes, so a floating parent can stay visible meanwhile. */
  onOpenChange?: (open: boolean) => void;
  /** Renders the trigger as a toolbar button, so it joins a `Toolbar`'s arrow-key focus. */
  inToolbar?: boolean;
}

/**
 * A button that opens a small form to set, change, or remove the link on the selected text.
 * It shows as pressed while the selection is a link. Enter saves; an empty address removes
 * the link; Escape closes and returns to the document.
 *
 *   <Editor.Root>
 *     <EditorLinkPopover />
 *   </Editor.Root>
 */
export function EditorLinkPopover({
  defaultOpen = false,
  onOpenChange,
  inToolbar = false,
}: EditorLinkPopoverProps) {
  const editor = useEditorInstance();
  const href = useEditorState(({ editor: current }) => {
    const value: unknown = current.getAttributes("link").href;
    return typeof value === "string" ? value : "";
  });
  const [draft, setDraft] = useState(href);
  const [open, setOpen] = useState(defaultOpen);
  const setOpenAndNotify = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  const trigger = <Toggle size="sm" aria-label="Link" pressed={href !== ""} />;

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(href);
        setOpenAndNotify(next);
      }}
    >
      <Popover.Trigger
        render={inToolbar ? <Toolbar.Button render={trigger}>{linkIcon}</Toolbar.Button> : trigger}
      >
        {inToolbar ? undefined : linkIcon}
      </Popover.Trigger>
      <Popover.Content side="bottom" style={styles.content}>
        <form
          data-slot="editor-link-form"
          {...stylex.props(styles.form)}
          onSubmit={(event) => {
            event.preventDefault();
            const address = draft.trim();
            const chain = editor.chain().focus().extendMarkRange("link");
            if (address === "") chain.unsetLink().run();
            else chain.setLink({ href: withProtocol(address) }).run();
            setOpenAndNotify(false);
          }}
        >
          <Input
            aria-label="Link address"
            placeholder="Paste a link"
            inputMode="url"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            style={styles.input}
          />
          <Button type="submit" size="sm">
            Apply
          </Button>
          {href ? (
            <>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Open link"
                render={<a href={href} target="_blank" rel="noreferrer" />}
                nativeButton={false}
              >
                <ExternalLinkIcon />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Remove link"
                onClick={() => {
                  editor.chain().focus().extendMarkRange("link").unsetLink().run();
                  setOpenAndNotify(false);
                }}
              >
                <UnlinkIcon />
              </Button>
            </>
          ) : null}
        </form>
      </Popover.Content>
    </Popover.Root>
  );
}

/** "example.com" becomes "https://example.com"; mailto:, tel:, and /paths are left alone. */
function withProtocol(address: string): string {
  return /^([a-z][a-z0-9+.-]*:|\/|#)/i.test(address) ? address : `https://${address}`;
}

const linkIcon = <LinkIcon />;

const styles = stylex.create({
  content: { padding: spacing["2"], width: "auto" },
  form: { gap: spacing["1.5"], alignItems: "center", display: "flex" },
  input: { color: colors.foreground, width: "14rem" },
});

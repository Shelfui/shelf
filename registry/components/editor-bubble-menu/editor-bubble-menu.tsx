"use client";

import type { Editor } from "@tiptap/core";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import * as stylex from "@stylexjs/stylex";
import { useRef, type ComponentType, type ReactNode } from "react";
import { elevation, colors, radius } from "../../foundations/tokens.stylex";
import { activeBlock, BLOCKS } from "../editor/blocks";
import { useEditorInstance, useEditorState } from "../editor/editor";
import { EditorLinkPopover } from "../editor-link-popover/editor-link-popover";
import * as DropdownMenu from "../dropdown-menu/dropdown-menu";
import { Button } from "../button/button";
import {
  BoldIcon,
  ChevronDownIcon,
  CodeIcon,
  HighlightIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
  type IconProps,
} from "../icons/icons";
import { Toggle } from "../toggle/toggle";
import * as Toolbar from "../toolbar/toolbar";
import type { Styled } from "../../lib/utils";

type Mark = "bold" | "italic" | "underline" | "strike" | "code" | "highlight";

const MARKS: Record<
  Mark,
  { label: string; icon: ComponentType<IconProps>; toggle: (editor: Editor) => boolean }
> = {
  bold: {
    label: "Bold",
    icon: BoldIcon,
    toggle: (editor) => editor.chain().focus().toggleBold().run(),
  },
  italic: {
    label: "Italic",
    icon: ItalicIcon,
    toggle: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  underline: {
    label: "Underline",
    icon: UnderlineIcon,
    toggle: (editor) => editor.chain().focus().toggleUnderline().run(),
  },
  strike: {
    label: "Strikethrough",
    icon: StrikethroughIcon,
    toggle: (editor) => editor.chain().focus().toggleStrike().run(),
  },
  code: {
    label: "Code",
    icon: CodeIcon,
    toggle: (editor) => editor.chain().focus().toggleCode().run(),
  },
  highlight: {
    label: "Highlight",
    icon: HighlightIcon,
    toggle: (editor) => editor.chain().focus().toggleHighlight().run(),
  },
};

export interface BubbleMenuProps extends Styled<{ "aria-label"?: string }> {
  /** The controls. Defaults to `<Formatting />`. */
  children?: ReactNode;
}

/**
 * A floating toolbar that follows the selected text. Put it inside `Editor.Root`; it shows
 * while text is selected in the editable document and stays hidden in code blocks.
 *
 *   <Editor.Root>
 *     <Editor.Content />
 *     <EditorBubbleMenu />
 *   </Editor.Root>
 *
 * Pass children to choose the controls: `MarkToggle`, `TurnInto`, `EditorLinkPopover`.
 */
export function EditorBubbleMenu({
  "aria-label": label = "Formatting",
  children,
  style,
}: BubbleMenuProps) {
  // The link form lives in a portal, so the document loses focus while it is open.
  const pinned = useRef(false);

  return (
    <TiptapBubbleMenu
      data-slot="editor-bubble-menu"
      options={{ placement: "top", offset: 8 }}
      shouldShow={({ editor, element, state, view }) => {
        if (!editor.isEditable || state.selection.empty || editor.isActive("codeBlock")) {
          return false;
        }
        return view.hasFocus() || element.contains(document.activeElement) || pinned.current;
      }}
      // Keep the document focused when a control is pressed, except for text fields.
      onMouseDown={(event) => {
        if (!(event.target instanceof HTMLInputElement)) event.preventDefault();
      }}
    >
      <Toolbar.Root aria-label={label} style={[styles.surface, style]}>
        {children ?? (
          <Formatting
            onLinkOpenChange={(open) => {
              pinned.current = open;
            }}
          />
        )}
      </Toolbar.Root>
    </TiptapBubbleMenu>
  );
}

/** The default controls: turn into, bold, italic, underline, strike, code, link, highlight. */
export function Formatting({ onLinkOpenChange }: { onLinkOpenChange?: (open: boolean) => void }) {
  return (
    <>
      <TurnInto />
      <Toolbar.Separator />
      <Toolbar.Group aria-label="Text style">
        <MarkToggle mark="bold" />
        <MarkToggle mark="italic" />
        <MarkToggle mark="underline" />
        <MarkToggle mark="strike" />
        <MarkToggle mark="code" />
      </Toolbar.Group>
      <Toolbar.Separator />
      <EditorLinkPopover inToolbar onOpenChange={onLinkOpenChange} />
      <MarkToggle mark="highlight" />
    </>
  );
}

/** A toggle for one mark. It shows as pressed while the selection has the mark. */
export function MarkToggle({ mark }: { mark: Mark }) {
  const editor = useEditorInstance();
  const { label, icon: Icon, toggle } = MARKS[mark];
  const active = useEditorState(({ editor: current }) => current.isActive(mark));

  return (
    <Toolbar.Button
      render={
        <Toggle
          size="sm"
          aria-label={label}
          pressed={active}
          onPressedChange={() => toggle(editor)}
        />
      }
    >
      <Icon />
    </Toolbar.Button>
  );
}

/** A menu that changes the current block into another kind. */
export function TurnInto() {
  const editor = useEditorInstance();
  const current = useEditorState(({ editor: updated }) => activeBlock(updated).id);
  const block = BLOCKS.find((item) => item.id === current) ?? BLOCKS[0]!;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        render={
          <Toolbar.Button
            render={<Button variant="ghost" size="sm" aria-label={`Turn into, ${block.label}`} />}
          />
        }
      >
        {block.label}
        <ChevronDownIcon />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start">
        <DropdownMenu.Group>
          <DropdownMenu.Label>Turn into</DropdownMenu.Label>
          {BLOCKS.filter((item) => item.turnInto).map((item) => (
            <DropdownMenu.Item
              key={item.id}
              onClick={() => item.apply(editor.chain().focus()).run()}
            >
              <item.icon />
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

const styles = stylex.create({
  surface: {
    borderRadius: radius.lg,
    backgroundColor: colors.popover,
    boxShadow: elevation.lg,
    color: colors.popoverForeground,
    width: "max-content",
  },
});

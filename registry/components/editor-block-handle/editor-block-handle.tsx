"use client";

import { keydownHandler } from "@tiptap/pm/keymap";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { colors, spacing } from "../../foundations/tokens.stylex";
import { BLOCKS } from "../editor/blocks";
import {
  blockAtSelection,
  deleteBlock,
  duplicateBlock,
  insertBelow,
  moveBlock,
  moveLimits,
  selectBlock,
  type BlockRef,
} from "../editor/block-commands";
import { useEditorInstance, useEditorState } from "../editor/editor";
import { Button } from "../button/button";
import * as DropdownMenu from "../dropdown-menu/dropdown-menu";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  DeleteIcon,
  GripIcon,
  PlusIcon,
} from "../icons/icons";

/**
 * A handle that appears beside the block under the pointer.
 *
 * - The plus button adds an empty block below and opens the slash menu, if the editor has one.
 * - Drag the grip to move the block.
 * - Click the grip for a menu: turn into, move up or down, duplicate, delete.
 *
 * Moving also works without a pointer: Mod-Shift-Up and Mod-Shift-Down move the block that
 * holds the cursor.
 *
 *   <Editor.Root>
 *     <Editor.Content />
 *     <EditorBlockHandle />
 *   </Editor.Root>
 *
 * Lists, quotes, and task items get a handle per item, not one for the whole list.
 */
export function EditorBlockHandle() {
  const editor = useEditorInstance();
  // The block the handle currently sits beside.
  const [target, setTarget] = useState<BlockRef | null>(null);
  const limits = useEditorState(({ editor: current }) =>
    target ? moveLimits(current, target) : { up: false, down: false },
  );

  useEffect(() => {
    const move = (direction: -1 | 1) => () => {
      const block = blockAtSelection(editor);
      return block ? moveBlock(editor, block, direction) !== null : false;
    };
    const key = new PluginKey("shelf-block-move");
    const plugin = new Plugin({
      key,
      props: {
        handleKeyDown: keydownHandler({
          "Mod-Shift-ArrowUp": move(-1),
          "Mod-Shift-ArrowDown": move(1),
        }),
      },
    });
    // First in line, ahead of the document's own arrow-key handling.
    editor.registerPlugin(plugin, (added, plugins) => [added, ...plugins]);
    return () => {
      editor.unregisterPlugin(key);
    };
  }, [editor]);

  return (
    <DragHandle
      editor={editor}
      nested
      className={stylex.props(styles.handle).className}
      computePositionConfig={{ placement: "left-start", strategy: "absolute" }}
      // Keep the last block when the pointer leaves it for the handle itself.
      onNodeChange={({ node, pos }) => {
        if (node && pos >= 0) setTarget({ pos, size: node.nodeSize });
      }}
    >
      <Button
        size="icon-xs"
        variant="ghost"
        aria-label="Add block below"
        style={styles.button}
        onClick={() => {
          if (!target) return;
          insertBelow(editor, target);
          // Opens the slash menu when the editor has one.
          editor.commands.insertContent("/");
        }}
      >
        <PlusIcon />
      </Button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          render={
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label="Block options"
              title="Drag to move, click for options"
              style={[styles.button, styles.grip]}
            />
          }
        >
          <GripIcon />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="start" side="bottom">
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Turn into</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              {BLOCKS.filter((block) => block.turnInto).map((block) => (
                <DropdownMenu.Item
                  key={block.id}
                  onClick={() => {
                    if (target) block.apply(selectBlock(editor, target)).run();
                  }}
                >
                  <block.icon />
                  {block.label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            disabled={!limits.up}
            onClick={() => {
              const moved = target && moveBlock(editor, target, -1);
              if (moved) setTarget(moved);
            }}
          >
            <ArrowUpIcon />
            Move up
            <DropdownMenu.Shortcut>⌘⇧↑</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            disabled={!limits.down}
            onClick={() => {
              const moved = target && moveBlock(editor, target, 1);
              if (moved) setTarget(moved);
            }}
          >
            <ArrowDownIcon />
            Move down
            <DropdownMenu.Shortcut>⌘⇧↓</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={() => {
              if (target) duplicateBlock(editor, target);
            }}
          >
            <CopyIcon />
            Duplicate
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            variant="destructive"
            onClick={() => {
              if (target) deleteBlock(editor, target);
            }}
          >
            <DeleteIcon />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </DragHandle>
  );
}

const styles = stylex.create({
  handle: {
    gap: spacing["1"],
    alignItems: "center",
    display: "flex",
    paddingInlineEnd: spacing["1"],
  },
  button: { color: colors.mutedForeground },
  grip: { cursor: "grab" },
});

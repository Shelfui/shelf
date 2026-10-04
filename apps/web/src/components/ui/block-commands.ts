import type { Editor } from "@tiptap/core";
import type { Node } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";

/** A block as the block handle sees it: where it starts in the document, and how large it is. */
export interface BlockRef {
  pos: number;
  size: number;
}

const ITEMS = new Set(["listItem", "taskItem"]);

/** List items move and duplicate one at a time; everything else is a top-level block. */
export function blockAtSelection(editor: Editor): BlockRef | null {
  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth >= 1; depth--) {
    if (ITEMS.has($from.node(depth).type.name)) {
      return { pos: $from.before(depth), size: $from.node(depth).nodeSize };
    }
  }
  if ($from.depth < 1) return null;
  return { pos: $from.before(1), size: $from.node(1).nodeSize };
}

/** Whether the block has a sibling before it and after it, so it can move up or down. */
export function moveLimits(editor: Editor, block: BlockRef): { up: boolean; down: boolean } {
  const $pos = editor.state.doc.resolve(block.pos);
  return { up: $pos.index() > 0, down: $pos.index() < $pos.parent.childCount - 1 };
}

/** Swaps the block with its neighbour. Returns the block's new place, or null at the edge. */
export function moveBlock(editor: Editor, block: BlockRef, direction: -1 | 1): BlockRef | null {
  const { state } = editor;
  const $pos = state.doc.resolve(block.pos);
  const node = $pos.parent.maybeChild($pos.index());
  const sibling = $pos.parent.maybeChild($pos.index() + direction);
  if (!node || !sibling) return null;

  const from = block.pos;
  const to = from + node.nodeSize;
  // Positions after the removed block shift left by its size, which cancels out going down.
  const pos = direction < 0 ? from - sibling.nodeSize : from + sibling.nodeSize;
  const tr = state.tr.delete(from, to).insert(pos, node);
  tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 1)));
  editor.view.dispatch(tr.scrollIntoView());
  editor.view.focus();
  return { pos, size: block.size };
}

function emptyLike(node: Node | null) {
  return node && ITEMS.has(node.type.name)
    ? { type: node.type.name, content: [{ type: "paragraph" }] }
    : { type: "paragraph" };
}

/** Adds an empty block after this one (an empty item, inside a list) and puts the cursor in it. */
export function insertBelow(editor: Editor, block: BlockRef): void {
  const node = editor.state.doc.nodeAt(block.pos);
  const end = block.pos + block.size;
  editor
    .chain()
    .insertContentAt(end, emptyLike(node))
    .command(({ tr }) => {
      tr.setSelection(TextSelection.near(tr.doc.resolve(end + 1)));
      return true;
    })
    .focus()
    .run();
}

export function duplicateBlock(editor: Editor, block: BlockRef): void {
  const node = editor.state.doc.nodeAt(block.pos);
  if (node)
    editor
      .chain()
      .insertContentAt(block.pos + block.size, node.toJSON())
      .run();
}

export function deleteBlock(editor: Editor, block: BlockRef): void {
  editor
    .chain()
    .focus()
    .deleteRange({ from: block.pos, to: block.pos + block.size })
    .run();
}

/** A chain with the cursor inside the block, ready for a `Block.apply`. */
export function selectBlock(editor: Editor, block: BlockRef) {
  return editor
    .chain()
    .focus()
    .command(({ tr }) => {
      tr.setSelection(TextSelection.near(tr.doc.resolve(block.pos + 1)));
      return true;
    });
}

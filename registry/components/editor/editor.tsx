"use client";

import { mergeAttributes } from "@tiptap/core";
import type { Content as DocumentContent, Extensions, Editor as TiptapEditor } from "@tiptap/core";
import { Heading } from "@tiptap/extension-heading";
import { Highlight } from "@tiptap/extension-highlight";
import { Placeholder } from "@tiptap/extensions";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  Tiptap,
  useEditor,
  useTiptap,
  useTiptapState,
  type NodeViewProps,
} from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { colors, radius, spacing, typography } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";
import { Checkbox } from "../checkbox/checkbox";

export type { DocumentContent, Extensions };
export type Editor = TiptapEditor;

/** The editor instance of the nearest `Editor.Root`. */
export const useEditorInstance = (): Editor => useTiptap().editor;

/** Selects a value from the editor state; re-renders only when the value changes. */
export const useEditorState = useTiptapState;

export interface RootProps extends Styled<
  Omit<React.ComponentProps<"div">, "children" | "defaultValue">
> {
  /** Initial document: an HTML string or Tiptap JSON. The editor owns the document after that. */
  defaultValue?: DocumentContent;
  /** Called with the document as HTML on every change. Read JSON from `editor.getJSON()`. */
  onValueChange?: (html: string, editor: Editor) => void;
  editable?: boolean;
  /** Shown in the empty block that holds the cursor. */
  placeholder?: string;
  autoFocus?: boolean;
  /** Extra Tiptap extensions, added to the ones Shelf configures. Read once at mount. */
  extensions?: Extensions;
  children?: ReactNode;
}

/**
 * A block editor on Tiptap. `Root` creates the editor; `Content` renders it; any other part
 * (a bubble menu, a slash menu) reads the editor from context.
 *
 *   <Editor.Root aria-label="Document" defaultValue="<p>Hello</p>" placeholder="Write, or press / for commands">
 *     <Editor.Content />
 *     <EditorBubbleMenu />
 *   </Editor.Root>
 *
 * Bold, italic, underline, strike, code, links, headings 1 to 3, lists, task lists, quotes,
 * code blocks, dividers, and highlights are included. Add more with `extensions`.
 */
export function Root({
  defaultValue,
  onValueChange,
  editable = true,
  placeholder = "",
  "aria-label": label = "Editor",
  autoFocus = false,
  extensions = [],
  children,
  style,
  ...props
}: RootProps) {
  const editor = useEditor({
    // The editor mounts on the client; this avoids a server and client mismatch.
    immediatelyRender: false,
    content: defaultValue,
    editable,
    autofocus: autoFocus,
    extensions: [...baseExtensions(placeholder), ...extensions],
    editorProps: {
      attributes: {
        class: cls(styles.content),
        "aria-label": label,
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor: updated }) => onValueChange?.(updated.getHTML(), updated),
  });

  // `editable` can change after mount; the other options are read once.
  if (editor && editor.isEditable !== editable) editor.setEditable(editable);

  return (
    <div data-slot="editor" {...props} {...stylex.props(styles.root, style)}>
      {editor ? <Tiptap editor={editor}>{children}</Tiptap> : null}
    </div>
  );
}

/** The editable document. */
export function Content() {
  return <Tiptap.Content data-slot="editor-content" />;
}

function TaskItemView({ node, updateAttributes, editor }: NodeViewProps) {
  const checked = Boolean(node.attrs.checked);
  return (
    <NodeViewWrapper data-checked={checked} {...stylex.props(styles.taskItem)}>
      <span contentEditable={false} {...stylex.props(styles.taskCheckbox)}>
        <Checkbox
          aria-label="Done"
          checked={checked}
          disabled={!editor.isEditable}
          onCheckedChange={(next) => updateAttributes({ checked: next })}
        />
      </span>
      <NodeViewContent {...stylex.props(styles.taskBody, checked && styles.taskDone)} />
    </NodeViewWrapper>
  );
}

const cls = (...styleList: stylex.StaticStyles[]) => stylex.props(...styleList).className ?? "";

// Headings render a class per level, so each level styles itself without a descendant selector.
const StyledHeading = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const level = Number(node.attrs.level);
    const levelClass = [styles.h1, styles.h2, styles.h3][level - 1];
    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: cls(styles.block, styles.heading, levelClass),
      }),
      0,
    ];
  },
});

const StyledTaskItem = TaskItem.extend({
  addNodeView() {
    return ReactNodeViewRenderer(TaskItemView, { as: "li", className: cls(styles.taskListItem) });
  },
});

function baseExtensions(placeholder: string): Extensions {
  return [
    StarterKit.configure({
      heading: false,
      paragraph: { HTMLAttributes: { class: cls(styles.block) } },
      blockquote: { HTMLAttributes: { class: cls(styles.block, styles.quote) } },
      bulletList: { HTMLAttributes: { class: cls(styles.list, styles.bullets) } },
      orderedList: { HTMLAttributes: { class: cls(styles.list, styles.numbers) } },
      listItem: { HTMLAttributes: { class: cls(styles.listItem) } },
      codeBlock: { HTMLAttributes: { class: cls(styles.block, styles.codeBlock) } },
      code: { HTMLAttributes: { class: cls(styles.code) } },
      horizontalRule: { HTMLAttributes: { class: cls(styles.rule) } },
      link: {
        openOnClick: false,
        defaultProtocol: "https",
        HTMLAttributes: { class: cls(styles.link) },
      },
    }),
    StyledHeading.configure({ levels: [1, 2, 3] }),
    Highlight.configure({ HTMLAttributes: { class: cls(styles.highlight) } }),
    TaskList.configure({ HTMLAttributes: { class: cls(styles.list, styles.tasks) } }),
    StyledTaskItem.configure({ nested: true }),
    Placeholder.configure({
      placeholder,
      emptyNodeClass: cls(styles.emptyNode),
    }),
  ];
}

const styles = stylex.create({
  root: {
    color: colors.foreground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeBase,
    lineHeight: 1.65,
    position: "relative",
  },
  content: {
    outline: "none",
    overflowWrap: "anywhere",
    minHeight: "6rem",
  },
  block: {
    marginBlock: 0,
    paddingBlock: "0.1875rem",
  },
  emptyNode: {
    "::before": {
      color: colors.mutedForeground,
      content: "attr(data-placeholder)",
      float: "left",
      pointerEvents: "none",
      height: 0,
    },
  },
  heading: {
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: "-0.01em",
    lineHeight: 1.25,
  },
  h1: { fontSize: "1.875rem", marginTop: "1.5rem", paddingBottom: spacing["1"] },
  h2: { fontSize: "1.5rem", marginTop: "1.25rem", paddingBottom: spacing["1"] },
  h3: { fontSize: "1.25rem", marginTop: spacing["4"], paddingBottom: spacing["1"] },
  quote: {
    marginBlock: spacing["1"],
    marginInline: 0,
    borderInlineStartColor: colors.foreground,
    borderInlineStartStyle: "solid",
    borderInlineStartWidth: "3px",
    paddingInlineStart: spacing["4"],
  },
  list: {
    marginBlock: 0,
    paddingBlock: "0.1875rem",
    paddingInlineStart: spacing["6"],
  },
  bullets: { listStyleType: "disc" },
  numbers: { listStyleType: "decimal" },
  tasks: { listStyleType: "none", paddingInlineStart: 0 },
  listItem: { paddingBlock: 0 },
  taskListItem: { listStyleType: "none" },
  taskItem: {
    gap: spacing["2"],
    alignItems: "flex-start",
    display: "flex",
  },
  taskCheckbox: {
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    userSelect: "none",
    height: "1.65em",
  },
  taskBody: { flex: "1", minWidth: 0 },
  taskDone: { textDecoration: "line-through", color: colors.mutedForeground },
  codeBlock: {
    padding: spacing["4"],
    borderRadius: radius.lg,
    marginBlock: spacing["1"],
    marginInline: 0,
    backgroundColor: colors.muted,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    overflowX: "auto",
  },
  code: {
    borderRadius: radius.sm,
    paddingBlock: "0.125rem",
    paddingInline: "0.3em",
    backgroundColor: colors.muted,
    color: colors.destructiveText,
    fontFamily: typography.fontFamilyMono,
    fontSize: "0.875em",
  },
  rule: {
    borderColor: colors.border,
    borderStyle: "solid",
    borderWidth: 0,
    marginBlock: spacing["4"],
    borderTopWidth: 1,
  },
  link: {
    color: "inherit",
    cursor: "pointer",
    textDecorationColor: colors.ring,
    textDecorationLine: "underline",
    textUnderlineOffset: "0.2em",
  },
  highlight: {
    borderRadius: radius.sm,
    backgroundColor: "rgb(255 212 0 / 0.3)",
    color: "inherit",
  },
});

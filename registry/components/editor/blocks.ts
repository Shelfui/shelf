import type { ChainedCommands, Editor } from "@tiptap/core";
import type { ComponentType } from "react";
import {
  BulletListIcon,
  CodeBlockIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  MinusIcon,
  NumberedListIcon,
  QuoteIcon,
  TaskListIcon,
  TextIcon,
  type IconProps,
} from "../icons/icons";

/**
 * A kind of block a person can insert or turn the current block into. The slash menu, the
 * block handle, and the bubble menu all read this list. Edit it to change what they offer.
 *
 * `apply` receives a focused command chain and returns it with the change added.
 */
export interface Block {
  id: string;
  label: string;
  description: string;
  icon: ComponentType<IconProps>;
  /** Extra words the slash menu matches, besides the label. */
  keywords: string[];
  /** The group heading in the slash menu. */
  group: "Basic" | "Lists" | "Media";
  /** Whether the current block can become this one. Dividers can only be inserted. */
  turnInto: boolean;
  isActive: (editor: Editor) => boolean;
  apply: (chain: ChainedCommands) => ChainedCommands;
}

export const BLOCKS: Block[] = [
  {
    id: "text",
    label: "Text",
    description: "Plain paragraph text.",
    icon: TextIcon,
    keywords: ["paragraph", "p"],
    group: "Basic",
    turnInto: true,
    isActive: (editor) => editor.isActive("paragraph"),
    apply: (chain) => chain.clearNodes(),
  },
  ...([1, 2, 3] as const).map((level): Block => ({
    id: `heading-${level}`,
    label: `Heading ${level}`,
    description: ["Big section heading.", "Medium section heading.", "Small section heading."][
      level - 1
    ]!,
    icon: [Heading1Icon, Heading2Icon, Heading3Icon][level - 1]!,
    keywords: [`h${level}`, "title", "heading"],
    group: "Basic",
    turnInto: true,
    isActive: (editor) => editor.isActive("heading", { level }),
    apply: (chain) => chain.clearNodes().setNode("heading", { level }),
  })),
  {
    id: "bullet-list",
    label: "Bulleted list",
    description: "A simple list of points.",
    icon: BulletListIcon,
    keywords: ["ul", "unordered", "bullet"],
    group: "Lists",
    turnInto: true,
    isActive: (editor) => editor.isActive("bulletList"),
    apply: (chain) => chain.clearNodes().toggleBulletList(),
  },
  {
    id: "numbered-list",
    label: "Numbered list",
    description: "A list with numbered steps.",
    icon: NumberedListIcon,
    keywords: ["ol", "ordered", "number"],
    group: "Lists",
    turnInto: true,
    isActive: (editor) => editor.isActive("orderedList"),
    apply: (chain) => chain.clearNodes().toggleOrderedList(),
  },
  {
    id: "task-list",
    label: "To-do list",
    description: "Track tasks with checkboxes.",
    icon: TaskListIcon,
    keywords: ["todo", "task", "checkbox", "check"],
    group: "Lists",
    turnInto: true,
    isActive: (editor) => editor.isActive("taskList"),
    apply: (chain) => chain.clearNodes().toggleTaskList(),
  },
  {
    id: "quote",
    label: "Quote",
    description: "Capture a quotation.",
    icon: QuoteIcon,
    keywords: ["blockquote", "citation"],
    group: "Basic",
    turnInto: true,
    isActive: (editor) => editor.isActive("blockquote"),
    apply: (chain) => chain.clearNodes().toggleBlockquote(),
  },
  {
    id: "code",
    label: "Code",
    description: "Show code in a monospaced block.",
    icon: CodeBlockIcon,
    keywords: ["codeblock", "snippet", "pre"],
    group: "Media",
    turnInto: true,
    isActive: (editor) => editor.isActive("codeBlock"),
    apply: (chain) => chain.clearNodes().toggleCodeBlock(),
  },
  {
    id: "divider",
    label: "Divider",
    description: "Visually separate sections.",
    icon: MinusIcon,
    keywords: ["hr", "rule", "separator", "line"],
    group: "Basic",
    turnInto: false,
    isActive: () => false,
    apply: (chain) => chain.setHorizontalRule(),
  },
];

/** The block the cursor is in, for labelling a "Turn into" control. */
export function activeBlock(editor: Editor): Block {
  return (
    BLOCKS.filter((block) => block.turnInto && block.id !== "text").find((block) =>
      block.isActive(editor),
    ) ?? BLOCKS[0]!
  );
}

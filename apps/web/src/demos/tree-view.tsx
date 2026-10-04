"use client";

import { FileIcon } from "@/components/ui/icons";
import { type TreeNode, TreeView } from "@/components/ui/tree-view";

const FILES: TreeNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "app", label: "app.tsx", icon: <FileIcon /> },
      {
        id: "lib",
        label: "lib",
        children: [{ id: "utils", label: "utils.ts", icon: <FileIcon /> }],
      },
    ],
  },
  { id: "readme", label: "README.md", icon: <FileIcon /> },
];

export default function TreeViewDemo() {
  return <TreeView aria-label="Files" items={FILES} defaultExpanded={["src"]} />;
}

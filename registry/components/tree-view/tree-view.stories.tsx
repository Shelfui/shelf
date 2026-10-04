import { expect, fn, userEvent } from "storybook/test";
import preview from "@/.storybook/preview";
import { FileIcon } from "../icons/icons";
import { type TreeNode, TreeView } from "./tree-view";

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

const meta = preview.meta({
  title: "Components/Tree View",
  component: TreeView,
  args: { items: FILES, "aria-label": "Files", onSelectedChange: fn() },
});

/** Clicking a branch opens it and selects it; clicking a leaf selects it. */
export const Default = meta.story({
  play: async ({ canvas, args }) => {
    await expect(canvas.queryByRole("treeitem", { name: "app.tsx" })).toBeNull();
    await userEvent.click(canvas.getByRole("treeitem", { name: "src" }));
    await expect(canvas.getByRole("treeitem", { name: "src" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await userEvent.click(await canvas.findByRole("treeitem", { name: "app.tsx" }));
    await expect(args.onSelectedChange).toHaveBeenLastCalledWith("app");
    await expect(canvas.getByRole("treeitem", { name: "app.tsx" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  },
});

/** Right opens, Right again enters, Left leaves or closes, Down and Up move, Enter selects. */
export const Keyboard = meta.story({
  play: async ({ canvas, args }) => {
    const first = canvas.getByRole("treeitem", { name: "src" });
    first.focus();

    await userEvent.keyboard("{ArrowRight}");
    await expect(first).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("treeitem", { name: "app.tsx" })).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}{ArrowRight}{ArrowDown}");
    await expect(canvas.getByRole("treeitem", { name: "utils.ts" })).toHaveFocus();
    await expect(canvas.getByRole("treeitem", { name: "utils.ts" })).toHaveAttribute(
      "aria-level",
      "3",
    );

    await userEvent.keyboard("{Enter}");
    await expect(args.onSelectedChange).toHaveBeenLastCalledWith("utils");

    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("treeitem", { name: "lib" })).toHaveFocus();

    await userEvent.keyboard("{End}");
    await expect(canvas.getByRole("treeitem", { name: "README.md" })).toHaveFocus();
  },
});

/** Only one row is in the tab order, so Tab passes through the tree in one stop. */
export const SingleTabStop = meta.story({
  args: { defaultExpanded: ["src"] },
  play: async ({ canvas }) => {
    const stops = canvas.getAllByRole("treeitem").filter((item) => item.tabIndex === 0);
    await expect(stops).toHaveLength(1);
  },
});

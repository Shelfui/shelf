import type { FrameNode } from "../../ir";
import type { WalkContext, ColorSlot } from "./context";
import { frame } from "./frame";
import { nameColors } from "./paint";
import { iconRoot } from "./svg";

/** Captures the element and its subtree, then names every color with its token. */
export function walk(element: Element, path: string, context: WalkContext): FrameNode {
  const slots: ColorSlot[] = [];
  const state = { path, context, slots };
  const root =
    element instanceof SVGElement ? iconRoot(element, state) : frame(element, state, undefined);
  nameColors(slots, context.index);
  return root;
}

export { CaptureError } from "./context";
export type { WalkContext } from "./context";
export { iconKey } from "./svg";

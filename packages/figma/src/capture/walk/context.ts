import type { Paint } from "../../ir";
import type { TokenIndex } from "../tokens";

/** A capture failure, with the path of the node and the CSS that Figma can't represent. */
export class CaptureError extends Error {
  override name = "CaptureError";
}

export interface WalkContext {
  index: TokenIndex;
  /** Icon markup → component name, such as `Icon/Plus`. */
  icons: Map<string, string>;
  /** Text content → TEXT property name, such as `Button` → `Label`. */
  textProperties: Map<string, string>;
  /** Component name → INSTANCE_SWAP property name, such as `Icon/Plus` → `Icon`. */
  instanceProperties: Map<string, string>;
}

/** A color the IR holds, and how to read it again during the marker passes. */
export interface ColorSlot {
  paint: Paint;
  read: () => string;
}

export interface Walk {
  path: string;
  context: WalkContext;
  slots: ColorSlot[];
}

/** How a frame lays out its children, from its CSS display. */
export type Kind = "row" | "column" | "grid" | "text";

/** What a child needs from the frame it's in. */
export interface Parent {
  element: Element;
  style: CSSStyleDeclaration;
  rect: DOMRect;
  kind: Kind;
}

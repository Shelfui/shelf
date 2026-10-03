import { color } from "./paint";

/** Text and inline elements next to block children, which CSS wraps in an anonymous block. */
export type Run = Array<Element | Text>;

export function runs(items: Array<Element | Text>): Array<Element | Text | Run> {
  const grouped: Array<Element | Text | Run> = [];
  for (const item of items) {
    const inline = item instanceof Text || plainInline(item);
    const last = grouped.at(-1);
    if (inline && Array.isArray(last)) last.push(item);
    else grouped.push(inline ? [item] : item);
  }
  return grouped.map((group) => (Array.isArray(group) && group.length === 1 ? group[0]! : group));
}

/** Positioned, or moved from its layout slot by a transform. */
export function outOfFlow(style: CSSStyleDeclaration): boolean {
  if (style.position === "absolute" || style.position === "fixed") return true;
  const matrix = style.transform
    .match(/^matrix\(([^)]+)\)$/)?.[1]
    ?.split(",")
    .map(Number);
  return !!matrix && (Math.abs(matrix[4] ?? 0) > 0.5 || Math.abs(matrix[5] ?? 0) > 0.5);
}

/** Degrees counterclockwise, for a transform that rotates. */
export function rotation(transform: string): number {
  const matrix = transform
    .match(/^matrix\(([^)]+)\)$/)?.[1]
    ?.split(",")
    .map(Number);
  if (!matrix) return 0;
  const [a = 1, b = 0] = matrix;
  return Math.round((-Math.atan2(b, a) * 180) / Math.PI);
}

/** Laid out in a line, like text. */
export function inlineLevel(element: Element): boolean {
  if (element instanceof SVGElement) return true;
  return getComputedStyle(element).display.startsWith("inline");
}

/** Inline, so its text flows into the text around it. */
export function plainInline(element: Element): boolean {
  return (
    !(element instanceof SVGElement) &&
    getComputedStyle(element).display === "inline" &&
    [...element.children].every(plainInline)
  );
}

/** Only text, possibly across inline elements such as a link. */
export function textOnly(element: HTMLElement): boolean {
  if (fieldText(element) !== undefined) return false;
  const items = contents(element);
  return (
    items.length > 0 &&
    items.every((item) => item instanceof Text || plainInline(item)) &&
    (element.textContent ?? "").trim() !== ""
  );
}

/** Padding, a border, a background, a shadow, or a size of its own, which text can't hold. */
export function hasBox(element: Element, style: CSSStyleDeclaration): boolean {
  const spaced = ["top", "right", "bottom", "left"].some(
    (side) =>
      parseFloat(style.getPropertyValue(`padding-${side}`)) > 0 ||
      parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0,
  );
  if (spaced || color(style.backgroundColor) || style.boxShadow !== "none") return true;
  const range = document.createRange();
  range.selectNodeContents(element);
  const glyphs = range.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  const block = !style.display.startsWith("inline");
  return (
    Math.abs(rect.height - glyphs.height) > 1 || (!block && Math.abs(rect.width - glyphs.width) > 1)
  );
}

/** Children Figma draws: not hidden, not visually hidden like Base UI's native inputs. */
export function contents(element: Element): Array<Element | Text> {
  return [...element.childNodes].filter((child): child is Element | Text => {
    if (child instanceof Text) return (child.textContent ?? "").trim() !== "";
    return child instanceof Element && !hidden(child);
  });
}

export function hidden(element: Element): boolean {
  const style = getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return true;
  if (parseFloat(style.opacity) === 0) return true;
  if (style.clip === "rect(0px, 0px, 0px, 0px)" || style.clipPath === "inset(50%)") return true;
  const rect = element.getBoundingClientRect();
  if (rect.width > 1 || rect.height > 1) return false;
  // A zero-size box can still be the parent of what is drawn, like Recharts' wrapper around a Sankey.
  const overflows = style.overflowX === "visible" && style.overflowY === "visible";
  return !(overflows && [...element.children].some((child) => !hidden(child)));
}

/** The text an input, textarea or select shows: its value, else its placeholder. */
export function fieldText(element: Element): string | undefined {
  if (element instanceof HTMLSelectElement) {
    return element.selectedOptions[0]?.textContent?.trim() ?? "";
  }
  if (element instanceof HTMLTextAreaElement) return element.value || element.placeholder;
  if (
    element instanceof HTMLInputElement &&
    !["checkbox", "radio", "range", "file"].includes(element.type)
  ) {
    return element.value || element.placeholder;
  }
  return undefined;
}

export function contentBox(rect: DOMRect, style: CSSStyleDeclaration): DOMRect {
  const side = (name: string) =>
    parseFloat(style.getPropertyValue(`padding-${name}`)) +
    parseFloat(style.getPropertyValue(`border-${name}-width`));
  return new DOMRect(
    rect.left + side("left"),
    rect.top + side("top"),
    rect.width - side("left") - side("right"),
    rect.height - side("top") - side("bottom"),
  );
}

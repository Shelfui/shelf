import type { TextNode, TextRange } from "../../ir";
import { familyName } from "../tokens";
import { CaptureError, type Walk, type Parent } from "./context";
import { type Run, hidden, contentBox } from "./dom";
import { childSizing } from "./layout";
import { color, track } from "./paint";
import { length, round } from "./units";

export function fieldNode(
  element: Element,
  characters: string,
  cursor: Walk,
  parent: CSSStyleDeclaration,
): TextNode {
  const placeholder =
    (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) &&
    !element.value;
  const read = () => getComputedStyle(element, placeholder ? "::placeholder" : null).color;
  const box = contentBox(element.getBoundingClientRect(), parent);
  const node = textNode(characters, element, read, cursor);
  node.name = placeholder ? "Placeholder" : "Value";
  node.sizing = { horizontal: "fill", vertical: "hug" };
  node.width = round(box.width);
  return node;
}

/** Text from a text node, or from an element whose inline children become styled ranges. */
export function text(
  source: Text | Element | Run,
  styled: Element,
  cursor: Walk,
  parent: Parent | undefined,
): TextNode {
  const { characters, pieces } = flatten(source, styled);
  const node = textNode(characters, styled, () => getComputedStyle(styled).color, cursor);
  const rect = rangeOf(source).getBoundingClientRect();
  node.width = round(rect.width);
  const style = getComputedStyle(styled);
  if (source instanceof Element && parent) {
    node.name = source.getAttribute("data-slot") ?? node.name;
    const box = source.getBoundingClientRect();
    Object.assign(node.sizing, childSizing(source, style, box, parent, node.sizing));
    if (node.sizing.horizontal !== "hug") node.width = round(box.width);
  }
  if (rect.height > node.lineHeight.value * 1.5 && node.sizing.horizontal === "hug") {
    node.sizing.horizontal = "fixed";
  }
  const ranges = pieces.flatMap((piece) => styledRange(piece, style, cursor));
  if (ranges.length > 0) node.ranges = ranges;
  return node;
}

function textNode(characters: string, styled: Element, read: () => string, cursor: Walk): TextNode {
  const { context, slots, path } = cursor;
  const style = getComputedStyle(styled);
  const paint = color(read());
  if (!paint) throw new CaptureError(`${path}: transparent text isn't supported in Figma.`);
  const fontSize = parseFloat(style.fontSize);
  const lineHeight =
    style.lineHeight === "normal" ? Math.round(fontSize * 1.2) : parseFloat(style.lineHeight);
  const node: TextNode = {
    type: "text",
    name: context.textProperties.get(characters) ?? "Text",
    characters,
    fill: track(slots, paint, read),
    fontFamily: familyName(style.fontFamily),
    fontWeight: length(parseFloat(style.fontWeight), "fontWeight", context),
    fontSize: length(fontSize, "fontSize", context),
    lineHeight: length(lineHeight, "lineHeight", context),
    letterSpacing: parseFloat(style.letterSpacing) || 0,
    underline: style.textDecorationLine.includes("underline"),
    sizing: { horizontal: "hug", vertical: "hug" },
    width: 0,
  };
  if (style.textAlign === "center") node.align = "center";
  if (style.textAlign === "right" || style.textAlign === "end") node.align = "right";
  const property = context.textProperties.get(characters);
  if (property) node.property = property;
  const family = context.index.families.get(node.fontFamily);
  const textStyle = context.index.textStyles.find(
    (candidate) =>
      candidate.fontFamily === family &&
      candidate.fontSize === node.fontSize.token &&
      candidate.lineHeight === node.lineHeight.token &&
      candidate.fontWeight === node.fontWeight.token,
  );
  if (textStyle) node.textStyle = textStyle.name;
  return node;
}

interface Piece {
  start: number;
  end: number;
  styled: Element;
}

export function rangeOf(source: Text | Element | Run): Range {
  const range = document.createRange();
  if (Array.isArray(source)) {
    range.setStartBefore(source[0]!);
    range.setEndAfter(source.at(-1)!);
  } else {
    range.selectNodeContents(source);
  }
  return range;
}

/** Characters with whitespace collapsed as the browser renders it, and who styles each run. */
function flatten(
  source: Text | Element | Run,
  base: Element,
): { characters: string; pieces: Piece[] } {
  let characters = "";
  const pieces: Piece[] = [];
  const add = (node: Text) => {
    let piece = (node.textContent ?? "").replace(/\s+/g, " ");
    if (characters === "" || /[ \n]$/.test(characters)) piece = piece.replace(/^ /, "");
    if (!piece) return;
    const styled = node.parentElement;
    if (styled && styled !== base) {
      pieces.push({ start: characters.length, end: characters.length + piece.length, styled });
    }
    characters += piece;
  };
  const visit = (nodes: Iterable<ChildNode>) => {
    for (const child of nodes) {
      if (child instanceof Text) add(child);
      else if (child instanceof HTMLBRElement) characters = `${characters.replace(/ $/, "")}\n`;
      else if (child instanceof Element && !hidden(child)) visit(child.childNodes);
    }
  };
  visit(source instanceof Text ? [source] : Array.isArray(source) ? source : source.childNodes);
  characters = characters.replace(/[ \n]+$/, "");
  for (const piece of pieces) piece.end = Math.min(piece.end, characters.length);
  return { characters, pieces: pieces.filter((piece) => piece.end > piece.start) };
}

function styledRange(piece: Piece, base: CSSStyleDeclaration, cursor: Walk): TextRange[] {
  const style = getComputedStyle(piece.styled);
  const range: TextRange = { start: piece.start, end: piece.end };
  if (style.color !== base.color) {
    const paint = color(style.color);
    if (paint) range.fill = track(cursor.slots, paint, () => getComputedStyle(piece.styled).color);
  }
  if (style.fontFamily !== base.fontFamily) range.fontFamily = familyName(style.fontFamily);
  if (style.fontWeight !== base.fontWeight) {
    range.fontWeight = length(parseFloat(style.fontWeight), "fontWeight", cursor.context);
  }
  if (style.fontSize !== base.fontSize) {
    range.fontSize = length(parseFloat(style.fontSize), "fontSize", cursor.context);
  }
  const underline = style.textDecorationLine.includes("underline");
  if (underline !== base.textDecorationLine.includes("underline")) range.underline = underline;
  return Object.keys(range).length > 2 ? [range] : [];
}

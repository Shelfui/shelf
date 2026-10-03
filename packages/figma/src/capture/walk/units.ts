import type { FrameNode, Length } from "../../ir";
import type { LengthRole } from "../tokens";
import { CaptureError, type WalkContext } from "./context";

export function length(value: number, role: LengthRole, context: WalkContext): Length {
  const rounded = round(value);
  const token = context.index.lengths[role].get(rounded);
  return token ? { value: rounded, token } : { value: rounded };
}

export function align(value: string, path: string): NonNullable<FrameNode["layout"]>["align"] {
  if (["normal", "stretch", "flex-start", "start"].includes(value)) return "start";
  if (value === "center") return "center";
  if (["flex-end", "end"].includes(value)) return "end";
  if (value === "baseline") return "baseline";
  throw new CaptureError(`${path}: align-items: ${value} isn't supported in Figma.`);
}

export function justify(value: string, path: string): NonNullable<FrameNode["layout"]>["justify"] {
  if (["normal", "flex-start", "start"].includes(value)) return "start";
  if (value === "center") return "center";
  if (["flex-end", "end"].includes(value)) return "end";
  if (value === "space-between") return "space-between";
  throw new CaptureError(`${path}: justify-content: ${value} isn't supported in Figma.`);
}

export function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function max(values: number[]): number {
  return Math.max(0, ...values);
}

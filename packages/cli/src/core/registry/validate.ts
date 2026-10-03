import { ShelfError } from "../errors";
import { ITEM_TYPES, type ItemType } from "./types";

export function requireString(value: unknown, where: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ShelfError(`${where} must be a non-empty string.`);
  }
  return value;
}

function isItemType(value: unknown): value is ItemType {
  return ITEM_TYPES.some((type) => type === value);
}

export function requireType(value: unknown, where: string): ItemType {
  if (!isItemType(value)) {
    throw new ShelfError(`${where} must be one of: ${ITEM_TYPES.join(", ")}.`);
  }
  return value;
}

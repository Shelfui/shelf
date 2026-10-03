/** `dialog-footer` → `Dialog Footer`. */
export function title(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** `a, b and c`. */
export function listNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/**
 * Sorts text the same on every machine. Revisions hash sorted paths, so this must not follow
 * the user's locale.
 */
export const compareText = new Intl.Collator("en").compare;

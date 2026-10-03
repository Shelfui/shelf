/** How a chart prints a number: `Intl.NumberFormat` options, or your own function. */
export type ChartFormat = Intl.NumberFormatOptions | ((value: number) => string);

/** The line shapes charts draw between points. */
export type ChartCurve = "smooth" | "linear" | "step";

/** The names Recharts uses for each `ChartCurve`. */
export function curveType(curve: ChartCurve): "monotone" | "linear" | "step" {
  if (curve === "smooth") return "monotone";
  return curve;
}

/**
 * Prints a chart value. Numbers go through `format` (with `locale`, or the browser's); anything else,
 * such as a month name, is printed as is.
 */
export function formatValue(value: unknown, format?: ChartFormat, locale?: string): string {
  if (typeof value === "string") return value;
  if (typeof value !== "number") return typeof value === "boolean" ? String(value) : "";
  if (typeof format === "function") return format(value);
  return new Intl.NumberFormat(locale, format).format(value);
}

/** The keys in `current` after toggling `key`, in a stable order. */
export function toggleKey(current: readonly string[], key: string): string[] {
  return current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
}

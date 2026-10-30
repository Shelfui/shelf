import { describe, expect, test } from "bun:test";
import { curveType, formatLabel, formatValue, toggleKey } from "./chart-format";

describe("chart format", () => {
  test("numbers print with Intl options in the given locale", () => {
    const usd = { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const;
    expect(formatValue(1800, usd, "en-US")).toBe("$1,800");
    expect(formatValue(1800, { notation: "compact" }, "en-US")).toBe("1.8K");
    expect(formatValue(1234.5, undefined, "de-DE")).toBe("1.234,5");
  });

  test("a function replaces Intl formatting", () => {
    expect(formatValue(3, (n) => `${n} pts`)).toBe("3 pts");
  });

  test("labels that are not numbers print as they are", () => {
    expect(formatValue("Jan", { notation: "compact" })).toBe("Jan");
    expect(formatValue(undefined)).toBe("");
    expect(formatValue({})).toBe("");
  });

  test("a label function gets text as well as numbers", () => {
    expect(formatLabel("2026-03-01", (date: string) => date.slice(5))).toBe("03-01");
    expect(formatLabel(2026, (year: number) => `FY${year}`)).toBe("FY2026");
  });

  test("labels fall back to value formatting", () => {
    expect(formatLabel("Jan", { notation: "compact" })).toBe("Jan");
    expect(formatLabel(1800, { notation: "compact" }, "en-US")).toBe("1.8K");
    expect(formatLabel(undefined, (date: string) => date)).toBe("");
  });

  test("toggling a key adds it, then removes it, leaving the rest in order", () => {
    expect(toggleKey(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleKey(["a", "b", "c"], "b")).toEqual(["a", "c"]);
  });

  test("curve names map to Recharts' interpolations", () => {
    expect(curveType("smooth")).toBe("monotone");
    expect(curveType("linear")).toBe("linear");
    expect(curveType("step")).toBe("step");
  });
});

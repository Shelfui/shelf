import { describe, expect, test } from "bun:test";
import { searchFor, searchGroups } from "../src/components/site/search-items";

const labels = (query: string) => searchFor(query).flatMap((g) => g.items.map((i) => i.label));

describe("site search", () => {
  test("an empty query lists everything, by kind", () => {
    expect(searchFor("  ")).toBe(searchGroups);
    expect(searchGroups.map((g) => g.value)).toEqual(["Pages", "Components", "Charts", "Blocks"]);
  });

  test("finds a component by its name, best match first", () => {
    expect(labels("dialog")[0]).toBe("Dialog");
  });

  test("finds a component by what it is for", () => {
    expect(labels("modal")).toContain("Dialog");
  });

  test("every word must match", () => {
    expect(labels("dialog zzzzqq")).toEqual([]);
  });

  test("every result links somewhere", () => {
    for (const group of searchFor("a")) {
      for (const item of group.items) expect(item.href.startsWith("/")).toBe(true);
    }
  });
});

import { describe, expect, test } from "bun:test";
import { HEATMAP_LEVELS, LEVEL_STRENGTH, heatmapLevel } from "./heatmap-levels";

describe("heatmap levels", () => {
  test("the smallest value is the lightest level and the largest is the strongest", () => {
    const values = [0, 5, 10];
    expect(heatmapLevel(0, values)).toBe(0);
    expect(heatmapLevel(10, values)).toBe(HEATMAP_LEVELS - 1);
  });

  test("values in between step up evenly", () => {
    const values = [0, 100];
    expect([0, 19, 20, 50, 79, 80, 100].map((v) => heatmapLevel(v, values))).toEqual([
      0, 0, 1, 2, 3, 4, 4,
    ]);
  });

  test("a flat table is all the middle level", () => {
    expect(heatmapLevel(7, [7, 7, 7])).toBe(2);
  });

  test("every level has a strength", () => {
    expect(LEVEL_STRENGTH).toHaveLength(HEATMAP_LEVELS);
  });
});

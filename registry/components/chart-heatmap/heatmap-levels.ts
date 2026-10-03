/** How many steps of strength a heatmap cell can have, from lightest to strongest. */
export const HEATMAP_LEVELS = 5;

/** The share of the color each level mixes in, lightest first. */
export const LEVEL_STRENGTH = [10, 28, 48, 72, 100] as const;

/**
 * The level of `value` among `values`: 0 for the smallest, `HEATMAP_LEVELS - 1` for the largest.
 * All-equal values are all the middle level, so a flat table does not look empty or full.
 */
export function heatmapLevel(value: number, values: readonly number[]): number {
  if (values.length === 0) return 0;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return Math.floor(HEATMAP_LEVELS / 2);
  const share = (value - min) / (max - min);
  return Math.min(HEATMAP_LEVELS - 1, Math.floor(share * HEATMAP_LEVELS));
}

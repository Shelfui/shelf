import { expect, test } from "vitest";
import { renderCount } from "../../test/render-count";
import * as Chart from "./chart";

const none: readonly string[] = [];
const some: readonly string[] = ["revenue"];

test("series and legend do not re-render when only the parent does", async () => {
  const run = await renderCount(
    (children) => (
      <Chart.Root aria-label="Revenue" hiddenSeries={none}>
        {children}
      </Chart.Root>
    ),
    Chart.useChart,
  );
  await run.rerender();
  expect(run.renders()).toBe(0);
  run.unmount();
});

test("series and legend do re-render when a series is hidden", async () => {
  const run = await renderCount(
    (children, tick) => (
      <Chart.Root aria-label="Revenue" hiddenSeries={tick % 2 === 0 ? none : some}>
        {children}
      </Chart.Root>
    ),
    Chart.useChart,
  );
  await run.rerender();
  expect(run.renders()).toBeGreaterThan(0);
  run.unmount();
});

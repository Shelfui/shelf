import { expect, test } from "vitest";
import { renderCount } from "../../test/render-count";
import { Root, useReasoning } from "./reasoning";

test("consumers do not re-render when only the parent of the reasoning does", async () => {
  const run = await renderCount(
    (children) => (
      <Root streaming seconds={2}>
        {children}
      </Root>
    ),
    useReasoning,
  );
  await run.rerender();
  expect(run.renders()).toBe(0);
  run.unmount();
});

test("consumers do re-render when thinking ends", async () => {
  const run = await renderCount(
    (children, tick) => <Root streaming={tick % 2 === 0}>{children}</Root>,
    useReasoning,
  );
  await run.rerender();
  expect(run.renders()).toBeGreaterThan(0);
  run.unmount();
});

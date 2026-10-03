import { expect, test } from "vitest";
import { renderCount } from "../../test/render-count";
import { Root, useComposerState } from "./composer";

const useStatus = () => useComposerState((s) => s.status);

test("consumers do not re-render when only the parent of the composer does", async () => {
  const run = await renderCount(
    (children) => <Root onSubmit={() => {}}>{children}</Root>,
    useStatus,
  );
  await run.rerender();
  expect(run.renders()).toBe(0);
  run.unmount();
});

test("consumers do re-render when the status changes", async () => {
  const run = await renderCount(
    (children, tick) => (
      <Root status={tick % 2 === 0 ? "ready" : "streaming"} onSubmit={() => {}}>
        {children}
      </Root>
    ),
    () => useComposerState((s) => s.busy),
  );
  await run.rerender();
  expect(run.renders()).toBeGreaterThan(0);
  run.unmount();
});

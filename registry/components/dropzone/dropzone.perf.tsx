import { expect, test } from "vitest";
import { renderCount } from "../../test/render-count";
import { Root, useDropzoneState } from "./dropzone";

const useDragging = () => useDropzoneState((s) => s.dragging);

test("consumers do not re-render when only the parent of the dropzone does", async () => {
  const run = await renderCount(
    (children) => <Root onFiles={() => {}}>{children}</Root>,
    useDragging,
  );
  await run.rerender();
  expect(run.renders()).toBe(0);
  run.unmount();
});

test("consumers do re-render when the dropzone is disabled", async () => {
  const run = await renderCount(
    (children, tick) => (
      <Root disabled={tick % 2 === 1} onFiles={() => {}}>
        {children}
      </Root>
    ),
    () => useDropzoneState((s) => s.disabled),
  );
  await run.rerender();
  expect(run.renders()).toBeGreaterThan(0);
  run.unmount();
});

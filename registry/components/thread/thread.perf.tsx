import { expect, test } from "vitest";
import { renderCount } from "../../test/render-count";
import { Root, useThreadState } from "./thread";

const useAtLatest = () => useThreadState((s) => s.atLatest);

test("consumers do not re-render when only the parent of the thread does", async () => {
  const run = await renderCount((children) => <Root>{children}</Root>, useAtLatest);
  await run.rerender();
  expect(run.renders()).toBe(0);
  run.unmount();
});

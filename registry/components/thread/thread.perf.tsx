import { expect, test } from "vitest";
import { renderCount } from "../../test/render-count";
import { Content, Root, useThreadState, Viewport } from "./thread";

const useAtLatest = () => useThreadState((s) => s.atLatest);

test("consumers do not re-render when only the parent of the thread does", async () => {
  const run = await renderCount((children) => <Root>{children}</Root>, useAtLatest);
  await run.rerender();
  expect(run.renders()).toBe(0);
  run.unmount();
});

test("consumers do re-render when the user scrolls away from the newest message", async () => {
  const run = await renderCount(
    (children) => (
      <div>
        <Root>
          <Viewport>
            <Content>
              <div>{children}</div>
              <div>tall</div>
            </Content>
          </Viewport>
        </Root>
      </div>
    ),
    useAtLatest,
  );
  const viewport = document.querySelector<HTMLElement>("[data-slot=thread-viewport]")!;
  const content = document.querySelector<HTMLElement>("[data-slot=thread-content]")!;
  viewport.style.height = "100px";
  viewport.style.overflowY = "auto";
  content.style.height = "1000px";
  await new Promise((resolve) => setTimeout(resolve, 100));

  const before = run.renders();
  viewport.scrollTop = viewport.scrollHeight;
  viewport.dispatchEvent(new Event("scroll"));
  await new Promise((resolve) => setTimeout(resolve, 100));
  viewport.scrollTop = 0;
  viewport.dispatchEvent(new Event("scroll"));
  await new Promise((resolve) => setTimeout(resolve, 200));

  expect(run.renders()).toBeGreaterThan(before);
  run.unmount();
});

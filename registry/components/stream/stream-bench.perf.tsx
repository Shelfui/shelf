import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { fixture } from "./stream-fixture.test";
import { Stream } from "./stream";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

/** Characters released per frame. Paced text moves about this much at once on a fast stream. */
const STEP = 12;

interface Result {
  p50: number;
  p95: number;
  shift: number;
  nodes: number;
  wordSpans: number;
}

/** Streams `text` the way the pacing releases it and measures each commit. */
async function stream(text: string, animation: "fade" | "none"): Promise<Result> {
  let shift = 0;
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const value: unknown = Reflect.get(entry, "value");
      if (typeof value === "number" && !Reflect.get(entry, "hadRecentInput")) shift += value;
    }
  });
  observer.observe({ type: "layout-shift", buffered: false });

  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const times: number[] = [];
  for (let at = STEP; at < text.length + STEP; at += STEP) {
    const received = text.slice(0, at);
    const began = performance.now();
    await act(async () =>
      root.render(
        <Stream streaming smooth={false} animation={animation}>
          {received}
        </Stream>,
      ),
    );
    times.push(performance.now() - began);
  }
  // Layout shifts are delivered after the frame; give the last ones time to arrive.
  await new Promise((resolve) => requestAnimationFrame(resolve));
  observer.disconnect();

  times.sort((a, b) => a - b);
  const result = {
    p50: times[Math.floor(times.length * 0.5)]!,
    p95: times[Math.floor(times.length * 0.95)]!,
    shift,
    nodes: container.querySelectorAll("*").length,
    wordSpans: container.querySelectorAll("p span, li span").length,
  };
  act(() => root.unmount());
  container.remove();
  return result;
}

for (const size of [20, 100]) {
  test(`streaming ${size} KB stays under budget with word animation`, async () => {
    const text = fixture().repeat(size / 20);
    const result = await stream(text, "fade");

    // Per-commit cost is flat: it must not depend on how much has already streamed.
    expect(result.p95).toBeLessThan(size === 20 ? 4 : 8);
    expect(result.shift).toBeLessThan(0.01);
    // Only the newest blocks hold word spans, so the count stays small however long the text is.
    expect(result.wordSpans).toBeLessThan(120);
  }, 120_000);
}

const list = Array.from(
  { length: 300 },
  (_, n) => `- Item ${n + 1} with **bold** and \`code\``,
).join("\n");
const fence =
  "```ts\n" + Array.from({ length: 500 }, (_, n) => `const value${n} = ${n};`).join("\n");

test("a 300-item list streams as cheaply as prose, with few animated words", async () => {
  const result = await stream(list, "fade");
  // Finished items are skipped and only the last two animate.
  expect(result.p95).toBeLessThan(5);
  expect(result.wordSpans).toBeLessThan(40);
  expect(result.shift).toBeLessThan(0.01);
}, 120_000);

test("a 500-line code fence still being written costs almost nothing per commit", async () => {
  const result = await stream(fence, "fade");
  expect(result.p95).toBeLessThan(3);
  expect(result.wordSpans).toBe(0);
}, 120_000);

import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { fixture } from "./stream-fixture.test";
import { Stream } from "./stream";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

test("streaming 20 KB commits quickly and leaves the finished text intact", async () => {
  const text = fixture();
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  const step = 40;
  let commits = 0;
  const began = performance.now();
  for (let at = step; at < text.length + step; at += step) {
    const received = text.slice(0, at);
    await act(async () =>
      root.render(
        <Stream streaming smooth={false}>
          {received}
        </Stream>,
      ),
    );
    commits++;
  }
  const perCommit = (performance.now() - began) / commits;

  // A budget for the whole pipeline (split, heal, render) on one commit. It catches a return to
  // re-rendering every block per token, not machine noise.
  expect(perCommit).toBeLessThan(6);

  await act(async () => root.render(<Stream>{text}</Stream>));
  expect(container.textContent).toContain("Section 1");
  expect(container.querySelectorAll("h2").length).toBeGreaterThan(5);

  act(() => root.unmount());
  container.remove();
}, 60_000);

async function mount(element: React.ReactElement) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(element));
  const render = (next: React.ReactElement) => act(async () => root.render(next));
  const dispose = () => {
    act(() => root.unmount());
    container.remove();
  };
  return { container, render, dispose };
}

const words = (container: HTMLElement) => container.querySelectorAll("p span");

test("a word that has already appeared is never rebuilt, so it plays its animation once", async () => {
  const { container, render, dispose } = await mount(
    <Stream streaming smooth={false}>
      {"Hello wor"}
    </Stream>,
  );
  const [first, second] = Array.from(words(container));
  expect(second?.textContent).toBe("wor");

  await render(
    <Stream streaming smooth={false}>
      {"Hello world and more"}
    </Stream>,
  );
  const after = Array.from(words(container));
  expect(after.map((word) => word.textContent)).toEqual(["Hello", "world", "and", "more"]);
  expect(after[0]).toBe(first);
  // The word still being typed grows in place.
  expect(after[1]).toBe(second);
  dispose();
});

test("only the newest blocks hold word spans, and finished text is plain", async () => {
  const text = "One.\n\nTwo.\n\nThree.\n\nFour.";
  const { container, render, dispose } = await mount(
    <Stream streaming smooth={false}>
      {text}
    </Stream>,
  );
  const blocks = Array.from(container.querySelectorAll("[data-slot=markdown-block]"));
  expect(blocks.map((block) => block.querySelectorAll("span").length)).toEqual([0, 0, 1, 1]);

  await render(<Stream smooth={false}>{text}</Stream>);
  expect(container.querySelectorAll("span").length).toBe(0);
  expect(container.textContent).toBe("One.Two.Three.Four.");
  dispose();
});

test("animation none leaves text unwrapped", async () => {
  const { container, dispose } = await mount(
    <Stream streaming smooth={false} animation="none">
      {"No spans here"}
    </Stream>,
  );
  expect(container.querySelectorAll("span").length).toBe(0);
  dispose();
});

test("words inside lists and emphasis animate too, code does not", async () => {
  const { container, dispose } = await mount(
    <Stream streaming smooth={false} animation="rise">
      {"- one **two** three\n\n```ts\nconst a = 1;\n```"}
    </Stream>,
  );
  expect(container.querySelectorAll("li span").length).toBe(3);
  // Code is highlighted by the code block, never split into words.
  expect(container.querySelector("pre code")?.textContent).toBe("const a = 1;");
  dispose();
});

test("paced text reveals whole words and ends on the full text", async () => {
  const full = "alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron";
  const { container, render, dispose } = await mount(<Stream streaming>{"alpha "}</Stream>);
  await render(<Stream streaming>{full}</Stream>);

  const seen = new Set<string>();
  for (let i = 0; i < 120 && container.textContent !== full; i++) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    seen.add(container.textContent ?? "");
  }
  expect(container.textContent).toBe(full);
  for (const text of seen) {
    // Every step ends on a word, never inside one.
    expect(full.startsWith(text) && (text === full || full[text.length] === " ")).toBe(true);
  }
  dispose();
});

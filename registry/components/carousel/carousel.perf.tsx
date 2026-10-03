import { expect, test } from "vitest";
import { renderCount } from "../../test/render-count";
import * as Carousel from "./carousel";

test("slides and controls do not re-render when only the parent does", async () => {
  const run = await renderCount(
    (children) => <Carousel.Root aria-label="Photos">{children}</Carousel.Root>,
    Carousel.useCarousel,
  );
  await run.rerender();
  expect(run.renders()).toBe(0);
  run.unmount();
});

test("slides and controls do re-render when the orientation changes", async () => {
  const run = await renderCount(
    (children, tick) => (
      <Carousel.Root aria-label="Photos" orientation={tick % 2 === 0 ? "horizontal" : "vertical"}>
        {children}
      </Carousel.Root>
    ),
    Carousel.useCarousel,
  );
  await run.rerender();
  expect(run.renders()).toBeGreaterThan(0);
  run.unmount();
});

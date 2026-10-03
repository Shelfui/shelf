import { expect, test } from "vitest";
import { renderCount } from "../../test/render-count";
import { SidebarProvider, useSidebar } from "./sidebar";

test("consumers do not re-render when only the app shell above the provider does", async () => {
  const run = await renderCount(
    (children) => <SidebarProvider defaultOpen>{children}</SidebarProvider>,
    useSidebar,
  );
  await run.rerender();
  expect(run.renders()).toBe(0);
  run.unmount();
});

test("consumers do re-render when the sidebar opens or closes", async () => {
  const run = await renderCount(
    (children, tick) => <SidebarProvider open={tick % 2 === 0}>{children}</SidebarProvider>,
    useSidebar,
  );
  await run.rerender();
  expect(run.renders()).toBeGreaterThan(0);
  run.unmount();
});

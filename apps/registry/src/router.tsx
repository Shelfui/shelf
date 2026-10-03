import {
  Outlet,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from "@tanstack/react-router";
import { Layout } from "@/components/site/layout";
import { inPluginWindow } from "@/figma";
import { Catalog } from "@/views/catalog";
import { NotFound } from "@/views/not-found";
import type { UsageSearch } from "@/views/usage";

interface CatalogSearch {
  q?: string;
  type?: string;
}

const rootRoute = createRootRoute({
  // Inside Figma, the plugin window shows the page alone.
  component: () =>
    inPluginWindow() ? (
      <Outlet />
    ) : (
      <Layout>
        <Outlet />
      </Layout>
    ),
  notFoundComponent: () => <NotFound />,
});

const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    ...(typeof search["q"] === "string" && search["q"] && { q: search["q"] }),
    ...(typeof search["type"] === "string" && search["type"] && { type: search["type"] }),
  }),
  component: Catalog,
});

const itemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/items/$name",
  component: lazyRouteComponent(() => import("@/views/item"), "Item"),
});

const usageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/usage",
  validateSearch: (search: Record<string, unknown>): UsageSearch => ({
    ...(typeof search["q"] === "string" && search["q"] && { q: search["q"] }),
    ...(typeof search["ns"] === "string" && search["ns"] && { ns: search["ns"] }),
    ...(typeof search["state"] === "string" && search["state"] && { state: search["state"] }),
  }),
  component: lazyRouteComponent(() => import("@/views/usage"), "Usage"),
});

const foundationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/foundations",
  component: lazyRouteComponent(() => import("@/views/foundations"), "Foundations"),
});

const figmaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/figma",
  validateSearch: (search: Record<string, unknown>): { plugin?: 1 } =>
    search["plugin"] === undefined ? {} : { plugin: 1 },
  component: lazyRouteComponent(() => import("@/views/figma"), "Figma"),
});

// Project ids contain slashes (`payments/bill-pay`), so the rest of the path is the id.
const projectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$",
  component: lazyRouteComponent(() => import("@/views/project"), "Project"),
});

const routeTree = rootRoute.addChildren([
  catalogRoute,
  itemRoute,
  foundationsRoute,
  figmaRoute,
  usageRoute,
  projectRoute,
]);

// Hash history: a static host serves index.html at any base path without rewrites.
export const router = createRouter({
  routeTree,
  history: createHashHistory(),
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

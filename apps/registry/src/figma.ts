import type { Library } from "../../../packages/figma/src/ir";
import type { FileInfo, FromUi } from "../../../packages/figma/src/protocol";
import { type IndexItem, type Registry, registryUrl } from "@/data";

export type { Library, Rgba } from "../../../packages/figma/src/ir";
export type { ApplyResult, FileInfo, ToUi } from "../../../packages/figma/src/protocol";

/** The Storybook story that renders everything the Shelf Figma plugin syncs. */
const LIBRARY_STORY = "figma-library--library";

declare global {
  interface Window {
    /** Set by the library story in the registry's Storybook frame. */
    shelfFigma?: { capture: () => Promise<Library> };
  }
}

/** Items whose revision the Figma file tracks besides its components. */
const FOUNDATION_ITEMS = ["foundations", "icons"];

/** True when this page is the Shelf plugin's window inside Figma. */
export function inPluginWindow(): boolean {
  const query = window.location.hash.split("?")[1] ?? "";
  return window.parent !== window && new URLSearchParams(query).has("plugin");
}

export function toPlugin(message: FromUi): void {
  window.parent.postMessage({ pluginMessage: message, pluginId: "*" }, "*");
}

export function hasFigmaLibrary(registry: Registry): boolean {
  return registry.stories.some((story) => story.id === LIBRARY_STORY);
}

/**
 * Renders the library story in an invisible same-origin frame and captures it. Capture
 * measures real layout, so the frame is laid out at a desktop size instead of hidden.
 */
export function captureLibrary(): Promise<Library> {
  return new Promise((resolve, reject) => {
    const frame = document.createElement("iframe");
    frame.title = "Shelf Figma library";
    frame.tabIndex = -1;
    frame.setAttribute("aria-hidden", "true");
    Object.assign(frame.style, {
      border: "0",
      height: "800px",
      left: "0",
      opacity: "0",
      pointerEvents: "none",
      position: "fixed",
      top: "0",
      width: "1280px",
      zIndex: "-1",
    });
    frame.src = new URL(
      `storybook/iframe.html?id=${LIBRARY_STORY}&viewMode=story&globals=theme:light`,
      registryUrl(),
    ).toString();
    const started = Date.now();
    const poll = () => {
      const api = frame.contentWindow?.shelfFigma;
      if (api) {
        api
          .capture()
          .then(resolve, (error: unknown) => reject(new Error(messageOf(error))))
          .finally(() => frame.remove());
      } else if (Date.now() - started > 60_000) {
        frame.remove();
        reject(
          new Error(`The ${LIBRARY_STORY} story didn't load from storybook/ within a minute.`),
        );
      } else {
        setTimeout(poll, 100);
      }
    };
    document.body.append(frame);
    poll();
  });
}

/** Adds each component's registry item, and the revisions the Figma file will record. */
export function forRegistry(library: Library, registry: Registry): Library {
  const components = library.components.map((set) => {
    const item = itemFor(registry, set.source);
    if (!item) return set;
    return {
      ...set,
      description: item.description,
      item: {
        name: item.name,
        revision: item.revision ?? "",
        docs: `${registry.url}#/items/${item.name}`,
        install: `bunx @shelfui/cli add ${item.name}`,
      },
    };
  });
  const tracked = [
    ...registry.items.filter((item) => FOUNDATION_ITEMS.includes(item.name)),
    ...components.flatMap((set) => {
      const item = set.item && registry.items.find((entry) => entry.name === set.item?.name);
      return item ? [item] : [];
    }),
  ];
  return {
    ...library,
    components,
    revisions: Object.fromEntries(tracked.map((item) => [item.name, item.revision ?? ""])),
  };
}

function itemFor(registry: Registry, source: string): IndexItem | undefined {
  return registry.items.find((item) => `/${source}`.includes(`/${item.path}/`));
}

interface FigmaChange {
  name: string;
  kind: "new" | "updated";
}

/** Items whose revision differs from what the Figma file last synced. */
export function changes(library: Library, synced: Record<string, string>): FigmaChange[] {
  return Object.entries(library.revisions ?? {}).flatMap(([name, revision]): FigmaChange[] => {
    if (!(name in synced)) return [{ name, kind: "new" }];
    return synced[name] === revision ? [] : [{ name, kind: "updated" }];
  });
}

/** `nodes` of the index.json `figma` block: each synced component and the Icons page, by item. */
export function figmaNodes(
  library: Library,
  file: FileInfo,
  registry: Registry,
): Record<string, string> {
  const nodes: Record<string, string> = {};
  for (const set of library.components) {
    const node = file.nodes[set.name];
    if (set.item && node) nodes[set.item.name] = node;
  }
  if (file.icons && registry.items.some((item) => item.name === "icons")) {
    nodes["icons"] = file.icons;
  }
  return nodes;
}

export function figmaFileUrl(key: string, name: string): string {
  const slug = encodeURIComponent(name.trim().replace(/\s+/g, "-")) || "Shelf";
  return `https://www.figma.com/design/${key}/${slug}`;
}

/**
 * Whether the registry already links these nodes in this file. Without the file key, node ids
 * alone decide: two files practically never share every id.
 */
export function linksCurrent(
  registry: Registry,
  nodes: Record<string, string>,
  key: string | null,
): boolean {
  const current = registry.figma;
  if (!current || (key && fileKey(current.file) !== key)) return false;
  const names = Object.keys(nodes);
  return (
    names.length === Object.keys(current.nodes).length &&
    names.every((name) => current.nodes[name] === nodes[name])
  );
}

export function fileKey(link: string): string | null {
  return /figma\.com\/(?:design|file)\/([A-Za-z0-9]+)/.exec(link)?.[1] ?? null;
}

function messageOf(error: unknown): string {
  // Errors from the Storybook frame come from another realm, so `instanceof Error` fails.
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }
  return String(error);
}

import type { FileInfo, FromUi, ToUi } from "../protocol";
import { NAMESPACE, apply, findShelfNodes, readRevisions } from "./apply";

declare const figma: PluginAPI;

/**
 * The registry is remembered on the file, not the person: only the library file's maintainers
 * run the plugin, so whoever connects it first connects it for everyone.
 */
const REGISTRY_KEY = "registry";
const SIZE = { width: 440, height: 640 };

open();

function open(): void {
  const registry = figma.root.getSharedPluginData(NAMESPACE, REGISTRY_KEY);
  if (registry) showRegistry(registry);
  else showSetup();
}

function showRegistry(registry: string): void {
  const page = new URL("#/figma?plugin=1", registry).toString();
  show(`<script>location.href = ${JSON.stringify(page)};</script>`);
}

function showSetup(message = ""): void {
  show(SETUP.replace("<!--message-->", escapeHtml(message)));
}

function show(html: string): void {
  figma.showUI(html, { ...SIZE, title: "Shelf", themeColors: true });
  figma.ui.off("message", onMessage);
  figma.ui.on("message", onMessage);
}

function onMessage(message: FromUi): void {
  handle(message).catch((error: unknown) =>
    post({ type: "error", message: error instanceof Error ? error.message : String(error) }),
  );
}

async function handle(message: FromUi): Promise<void> {
  switch (message.type) {
    case "status":
      post({ type: "status", file: await fileInfo() });
      return;
    case "sync": {
      const result = await apply(figma, message.library, {
        allowBreaking: message.allowBreaking ?? false,
      });
      if (result.status === "applied") {
        figma.root.setRelaunchData({ sync: "Check for Shelf updates" });
        figma.notify(`Shelf: ${result.summary.join(", ")}`);
      }
      post({ type: "synced", result, file: await fileInfo() });
      return;
    }
    case "registry": {
      const url = registryUrl(message.url);
      if (!url) {
        showSetup(`${message.url} isn't an http or https URL.`);
        return;
      }
      figma.root.setSharedPluginData(NAMESPACE, REGISTRY_KEY, url);
      showRegistry(url);
      return;
    }
    case "change-registry":
      figma.root.setSharedPluginData(NAMESPACE, REGISTRY_KEY, "");
      showSetup();
      return;
  }
}

async function fileInfo(): Promise<FileInfo> {
  const nodes: Record<string, string> = {};
  let icons: string | null = null;
  for (const [id, node] of await findShelfNodes(figma)) {
    if (id.startsWith("set:")) nodes[id.slice("set:".length)] = node.id;
    if (id.startsWith("icon:") && node.parent?.type === "PAGE") icons = node.parent.id;
  }
  return {
    key: figma.fileKey ?? null,
    name: figma.root.name,
    revisions: readRevisions(figma),
    nodes,
    icons,
  };
}

function post(message: ToUi): void {
  figma.ui.postMessage(message, { origin: "*" });
}

/** The registry directory URL, with a trailing slash so relative paths resolve inside it. */
function registryUrl(value: string): string | undefined {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    url.hash = "";
    url.search = "";
    if (!url.pathname.endsWith("/")) url.pathname += "/";
    return url.toString();
  } catch {
    return undefined;
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`);
}

const SETUP = `<!doctype html>
<style>
  body { margin: 0; padding: 20px; font: 13px/1.5 Inter, system-ui, sans-serif;
    color: var(--figma-color-text); background: var(--figma-color-bg); }
  h1 { font-size: 15px; font-weight: 600; margin: 0 0 8px; }
  p { margin: 0 0 16px; color: var(--figma-color-text-secondary); }
  .error { color: var(--figma-color-text-danger); }
  input { box-sizing: border-box; width: 100%; padding: 8px; margin-bottom: 12px; font: inherit;
    color: inherit; background: var(--figma-color-bg-secondary);
    border: 1px solid var(--figma-color-border); border-radius: 6px; }
  button { padding: 8px 14px; font: inherit; font-weight: 500; border: 0; border-radius: 6px;
    color: var(--figma-color-text-onbrand); background: var(--figma-color-bg-brand); }
</style>
<h1>Connect a Shelf registry</h1>
<p>The address your registry build is served from, such as https://ui.example.com/ or, locally,
http://127.0.0.1:4400/. It needs a Storybook: shelf build --storybook storybook-static.</p>
<p class="error"><!--message--></p>
<form>
  <label for="url">Registry URL</label>
  <input id="url" name="url" type="url" required autofocus placeholder="https://ui.example.com/">
  <button>Connect</button>
</form>
<script>
  document.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    parent.postMessage({ pluginMessage: { type: "registry", url: event.target.url.value } }, "*");
  });
</script>`;

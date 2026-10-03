import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import {
  CONFIG_FILE,
  type RegistryAuth,
  type ShelfConfig,
  isHttpRegistry,
  registryAuth,
  resolveRegistryLocation,
} from "../config";
import { ShelfError, errorMessage } from "../errors";
import { isObject } from "../json";
import { resolveInside } from "../paths";
import type { Registry } from "./types";

/** A registry path that has no file, as opposed to a registry that couldn't be read. */
export class MissingFileError extends ShelfError {
  override name = "MissingFileError";
}

const DEFAULT_TIMEOUT_MS = 15_000;

export function openRegistry(location: string, auth?: RegistryAuth): Registry {
  return isHttpRegistry(location) ? httpRegistry(location, auth) : localRegistry(location);
}

/** The project's registry from shelf.config.json, with its headers. */
export async function projectRegistry(config: ShelfConfig, cwd: string): Promise<Registry> {
  return openRegistry(
    resolveRegistryLocation(config.registry, cwd),
    await registryAuth(config, cwd),
  );
}

function localRegistry(root: string): Registry {
  if (!existsSync(root)) {
    throw new ShelfError(
      `Registry directory not found: ${root}. Check "registry" in shelf.config.json.`,
    );
  }
  return {
    location: root,
    async read(relativePath) {
      const file = resolveInside(root, relativePath);
      if (!existsSync(file)) {
        throw new MissingFileError(`Registry file not found: ${file}`);
      }
      return readFile(file, "utf8");
    },
  };
}

function httpRegistry(location: string, auth: RegistryAuth | undefined): Registry {
  const base = location.endsWith("/") ? location : `${location}/`;
  const timeoutMs = Number(process.env["SHELF_REGISTRY_TIMEOUT_MS"] ?? DEFAULT_TIMEOUT_MS);
  const authenticated = auth !== undefined && Object.keys(auth.headers).length > 0;
  if (authenticated && !isSecure(new URL(base))) {
    throw new ShelfError(
      `Refusing to send registry headers over ${new URL(base).protocol}//${new URL(base).host}. Use an https:// registry URL.`,
    );
  }
  return {
    location: base,
    async read(relativePath) {
      const url = new URL(relativePath, base).toString();
      if (!url.startsWith(new URL(base).toString())) {
        throw new ShelfError(`Registry path "${relativePath}" resolves outside ${base}.`);
      }
      try {
        const signal = AbortSignal.timeout(timeoutMs);
        const response = authenticated
          ? await fetchSameOrigin(url, auth.headers, signal)
          : await fetch(url, { signal });
        if (!response.ok) {
          const status = `Registry returned ${response.status} ${response.statusText} for ${url}`;
          if (response.status === 404) {
            const hint =
              authenticated && relativePath === "index.json"
                ? " (a private host may answer 404 when the token has no access)"
                : "";
            throw new MissingFileError(`${status.trim()}${hint}`);
          }
          const message = await serverMessage(response);
          throw new ShelfError(
            [
              `${status.trim()}${message ? `: ${message.replace(/[.!?]$/, "")}` : ""}.`,
              ...(response.status === 401 || response.status === 403 ? [authHint(auth)] : []),
            ].join(" "),
          );
        }
        return await response.text();
      } catch (error) {
        if (error instanceof ShelfError) throw error;
        if (error instanceof DOMException && error.name === "TimeoutError") {
          throw new ShelfError(
            `Registry request timed out after ${timeoutMs}ms: ${url}. Set SHELF_REGISTRY_TIMEOUT_MS to wait longer.`,
          );
        }
        throw new ShelfError(`Could not reach registry at ${url}: ${errorMessage(error)}`);
      }
    },
  };
}

const MAX_REDIRECTS = 5;

function isSecure(url: URL): boolean {
  return url.protocol === "https:" || ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
}

/**
 * Follows redirects only within the registry's origin: `fetch` forwards custom headers such as
 * an API key to any host a server redirects to.
 */
async function fetchSameOrigin(
  url: string,
  headers: Record<string, string>,
  signal: AbortSignal,
): Promise<Response> {
  let current = new URL(url);
  for (let redirects = 0; ; redirects++) {
    const response = await fetch(current, { headers, redirect: "manual", signal });
    const location = response.headers.get("location");
    if (response.status < 300 || response.status >= 400 || !location) return response;
    const next = new URL(location, current);
    if (next.origin !== current.origin) {
      throw new ShelfError(
        `Registry redirected ${current.origin}${current.pathname} to ${next.origin}${next.pathname}; it likely needs sign-in. Shelf sends registry headers only to ${current.origin}. Check the token header in "registry.headers" in ${CONFIG_FILE}.`,
      );
    }
    if (redirects === MAX_REDIRECTS) {
      throw new ShelfError(`Registry redirected more than ${MAX_REDIRECTS} times for ${url}.`);
    }
    current = next;
  }
}

/** The `message` or `error` of a JSON error body, safe to print. */
async function serverMessage(response: Response): Promise<string> {
  let body: unknown;
  try {
    body = JSON.parse(await response.text());
  } catch {
    return "";
  }
  if (!isObject(body)) return "";
  const text = [body["message"], body["error"]].find((value) => typeof value === "string");
  if (typeof text !== "string") return "";
  return text.replace(ANSI, "").replace(CONTROL, " ").replace(/\s+/g, " ").trim().slice(0, 300);
}

// oxlint-disable-next-line no-control-regex
const ANSI = /\u001b\[[0-9;?]*[ -/]*[@-~]|\u001b\][^\u0007]*\u0007/g;
// oxlint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f-\u009f]+/g;

function authHint(auth: RegistryAuth | undefined): string {
  if (!auth || Object.keys(auth.headers).length === 0) {
    return `This registry needs authentication. Add "headers" to "registry" in ${CONFIG_FILE}, e.g. { "url": "…", "headers": { "Authorization": "Bearer \${SHELF_REGISTRY_TOKEN}" } }.`;
  }
  return auth.variables.length > 0
    ? `Check that ${auth.variables.join(", ")} ${auth.variables.length === 1 ? "is" : "are"} valid for this registry.`
    : `Check "registry.headers" in ${CONFIG_FILE}.`;
}

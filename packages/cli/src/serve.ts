import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { type ServerResponse, createServer } from "node:http";
import path from "node:path";

export interface RegistryServer {
  url: URL;
  stop: () => Promise<void>;
}

const TYPES: Record<string, string> = {
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

async function respond(root: string, url: string, response: ServerResponse): Promise<void> {
  const file = registryFile(root, url);
  const info = file ? await stat(file).catch(() => undefined) : undefined;
  if (!file || !info?.isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, {
    "content-type": TYPES[path.extname(file)] ?? "text/plain; charset=utf-8",
    "content-length": info.size,
    "cache-control": "no-cache",
  });
  createReadStream(file).pipe(response);
}

/** The file a request path names, or undefined when it is malformed or leaves the registry. */
function registryFile(root: string, url: string): string | undefined {
  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(url, "http://registry").pathname);
  } catch {
    return undefined;
  }
  const file = path.resolve(root, `.${pathname}${pathname.endsWith("/") ? "index.html" : ""}`);
  return file.startsWith(root + path.sep) ? file : undefined;
}

/** Serves a registry directory over HTTP with the same layout `shelf add` reads locally. */
export async function serveRegistry(directory: string, port = 0): Promise<RegistryServer> {
  const root = path.resolve(directory);
  const server = createServer((request, response) => {
    void respond(root, request.url ?? "/", response);
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  const address = server.address();
  return {
    url: new URL(
      `http://127.0.0.1:${typeof address === "object" && address ? address.port : port}/`,
    ),
    stop: () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}

"use client";

import { useEffect } from "react";
import { searchFor } from "./search-items";

interface ModelContext {
  registerTool(
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      execute: (input: { query?: string }) => unknown;
      annotations?: { readOnlyHint?: boolean };
    },
    options?: { signal?: AbortSignal },
  ): unknown;
}

function hasRegisterTool(value: unknown): value is ModelContext {
  return (
    typeof value === "object" &&
    value !== null &&
    "registerTool" in value &&
    typeof value.registerTool === "function"
  );
}

/**
 * Offers the site search to browser agents through WebMCP, where the browser supports it.
 * Read only: it returns the same results as the Cmd+K palette.
 */
export function WebMcp() {
  useEffect(() => {
    const modelContext: unknown = Reflect.get(document, "modelContext");
    if (!hasRegisterTool(modelContext)) return undefined;

    const controller = new AbortController();
    void Promise.resolve(
      modelContext.registerTool(
        {
          name: "search_shelf",
          description:
            "Search the Shelf documentation, components, and blocks. Returns matching pages with their URL, kind, and description.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: 'Words to look for, such as "dialog", "modal", or "agents".',
              },
            },
            required: ["query"],
          },
          annotations: { readOnlyHint: true },
          execute: ({ query = "" }) => {
            const results = searchFor(query)
              .flatMap((group) => group.items)
              .slice(0, 20)
              .map((item) => ({
                title: item.label,
                kind: item.kind,
                url: new URL(item.href, window.location.origin).href,
                description: item.description,
              }));
            return { content: [{ type: "text", text: JSON.stringify(results) }] };
          },
        },
        { signal: controller.signal },
      ),
    ).catch(() => {});

    return () => controller.abort();
  }, []);

  return null;
}

---
title: TanStack Start
description: Set up Shelf in a TanStack Start project. Not yet tested end to end.
---

# TanStack Start

Set up Shelf in a TanStack Start project. Shelf has not been run end to end on TanStack Start yet.

## Create a project

```bash
npm create @tanstack/start@latest
```

Skip this if you already have a TanStack Start project.

## Set up StyleX

```bash
npm install @stylexjs/stylex
npm install -D @stylexjs/unplugin
```

TanStack Start builds with Vite, so StyleX uses the same plugin as a plain Vite app. Add it to `vite.config.ts` before the other plugins.

```ts
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import stylex from "@stylexjs/unplugin/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    stylex({ useCSSLayers: true }),
    tanstackStart(),
    // React's plugin must come after TanStack Start's.
    viteReact(),
  ],
});
```

If the styles are missing after you add a component, compare your setup with the `@stylexjs/unplugin` documentation and open an issue.

## Install the CLI

```bash
npm install -D @shelfui/cli
```

## Initialize Shelf

```bash
npx shelf init --registry {{registry}}
```

Writes `shelf.config.json` and `.shelf/lock.json`, and copies the path aliases from your `tsconfig.json`. It warns about anything missing from the StyleX setup above.

## Add components

```bash
npx shelf add button
```

Copies Button, the foundations it uses, and the packages it needs into your project, then records what it installed. The files are yours to edit.

## Check the result

```bash
npx shelf check
```

Verifies config, provenance, and imports. Your own build still covers the rest.

## Use a component

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Button>Save</Button>;
}
```

Import from the alias your `tsconfig.json` declares. `shelf init` copies it, so installed files use the same one.

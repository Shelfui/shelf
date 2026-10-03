---
title: Vite
description: Set up Shelf in a Vite and React project.
---

# Vite

Set up Shelf in a Vite and React project.

## Create a project

```bash
npm create vite@latest my-app -- --template react-ts
```

Skip this if you already have a Vite and React project.

## Set up StyleX

```bash
npm install @stylexjs/stylex
npm install -D @stylexjs/unplugin
```

Add the plugin to `vite.config.ts`, before the React plugin.

```ts
import stylex from "@stylexjs/unplugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [stylex({ useCSSLayers: true }), react()],
});
```

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
import { Button } from "./components/ui/button";

export function App() {
  return <Button>Save</Button>;
}
```

Importing `./styles/shelf/fonts.css` once in your entry file loads Geist.

---
title: Next.js
description: Set up Shelf in a Next.js project.
---

# Next.js

Set up Shelf in a Next.js project.

## Create a project

```bash
npx create-next-app@latest my-app --typescript --src-dir
```

Skip this if you already have a Next.js project. This site runs on Next with Shelf, so the steps below are the ones it uses.

## Set up StyleX

```bash
npm install @stylexjs/stylex
npm install -D @stylexjs/babel-plugin @stylexjs/postcss-plugin
```

Next compiles StyleX with Babel and writes the CSS with PostCSS. Add `babel.config.js`:

```js
const path = require("node:path");

module.exports = {
  presets: ["next/babel"],
  plugins: [
    [
      "@stylexjs/babel-plugin",
      {
        dev: process.env.NODE_ENV === "development",
        runtimeInjection: false,
        treeshakeCompensation: true,
        // Match the aliases in tsconfig.json.
        aliases: { "@/*": [path.join(__dirname, "src/*")] },
        unstable_moduleResolution: { type: "commonJS" },
      },
    ],
  ],
};
```

Add `postcss.config.js`, reusing the same Babel plugins:

```js
const babelConfig = require("./babel.config");

module.exports = {
  plugins: {
    "@stylexjs/postcss-plugin": {
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      babelConfig: {
        babelrc: false,
        parserOpts: { plugins: ["typescript", "jsx"] },
        plugins: babelConfig.plugins,
      },
      useCSSLayers: true,
    },
  },
};
```

Add the `@stylex` directive where the generated CSS should go, once, in the stylesheet your root layout imports (`src/app/globals.css`).

```css
@stylex;
```

A `babel.config.js` makes Next use Babel instead of SWC for your source, so builds are somewhat slower.

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
import { Button } from "@/components/ui/button";

export default function Page() {
  return <Button>Save</Button>;
}
```

Interactive components ship with `"use client"` where they need it, so you can import them from server components. For fonts, Shelf reads `--font-sans` and `--font-mono`, which works with `next/font`.

---
name: shelf
description: Adds, searches, updates, and checks Shelf components, the source-owned React and StyleX components in this project. Use when building UI, when the project has a shelf.config.json or a .shelf directory, or when asked about Shelf.
---

# Shelf

Shelf installs components as normal source files in this project and records what it installed in `.shelf/lock.json`. The files are the project's: change them like any other code. Shelf can still tell your changes from its own, so `npx shelf update` merges instead of overwriting.

## Before building UI

1. See what is installed and how the project is set up: `npx shelf status --json`. It reports the package manager, registry, paths, import aliases, and each item's revision, local changes, and available updates.
2. Look for an existing component: `npx shelf search <terms> --json`.
3. Read its documentation and examples: `npx shelf docs <item>`. Run `npx shelf docs` to list topics.
4. Add it: `npx shelf add <item>`. This copies the source, installs its packages, and records provenance.

Use the installed component and adapt it. Do not build a new one when a Shelf item covers the need.

## Changing components

Edit the installed files directly. Use semantic tokens from the foundations (for example `colors.surface`) instead of raw values, and keep styles in StyleX. Do not import an icon library directly in installed files: use the project's `icons` item.

## Before finishing

Run `npx shelf check --json`. It validates config, provenance, dependencies, and imports of installed files. Each issue has a `file`, a `problem`, and usually a `fix` command. Apply the fixes and run it again until `ok` is true. It does not run the project's TypeScript, lint, or build; run those too.

## Updating

`npx shelf status --json` shows items with `updateAvailable`. `npx shelf diff <item>` shows what an update brings. `npx shelf update` merges Shelf's changes into files that were edited. If it leaves conflict markers (`<<<<<<< yours`), resolve them using `npx shelf diff <item> --local` for context, then run check.

## Rules

- Never edit `.shelf/lock.json` by hand.
- Do not pass `--overwrite` unless the user asked to discard their changes to a file.
- Commit `.shelf/` together with the components.

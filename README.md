# Shelf

**The design system every product owns.**

Start with shared components, then make them yours. Shelf puts the source in every product and tracks every copy, so teams and agents move fast without leaving the system behind.

```bash
npm install -D @shelfui/cli
npx shelf init --registry <path-or-url>
npx shelf add button dialog
```

Shelf is open source and in early preview.

---

## Why

Companies with more than one product usually pick one of two models, and both break at scale.

- **A central package.** Products stay consistent, but even a spacing or color change becomes an override that breaks on upgrade, or a request that waits on the system team.
- **Local copies.** Products move fast, but nobody knows what changed, fixes stop reaching anyone, and every product slowly becomes its own design system.

Shelf keeps the strength of each. Every product owns its source, like a copy. Every copy stays tracked against one registry, like a package.

```text
SHARED PACKAGE          COPY AND OWN              SHELF

design system           a component               a registry
     │ install               │ copy                    │ shelf add
     ▼                       ▼                         ▼
your product            your source               your source

+ consistent            + fast and yours          + fast and yours
− its API is            − disconnected from       + tracked against
  the ceiling             where it came from        the registry
```

---

## How it works

**1. Add.** `shelf add` copies a component's source into your app, adds the Shelf items it builds on (foundations, icons, helpers), and installs its packages. It records a hash of every file in `.shelf/lock.json`. Commit it.

**2. Change.** The files are normal React and StyleX. Edit markup, styles, or behavior like any other code. Files nobody edits stay identical to the registry.

**3. Review.** Because Shelf knows what it installed, every file has three versions:

```text
BASE       what was installed
LOCAL      your file today
UPSTREAM   the registry's version now
```

`shelf status` lists which items you changed and which have a newer version. `shelf diff button` shows what an update brings; `shelf diff button --local` shows your changes.

**4. Update.** `shelf update` replaces files you haven't touched and merges upstream changes into files you have, with `git merge-file` against BASE. Overlapping edits get standard conflict markers. Nothing is written until every merge is computed.

**5. Check.** `shelf check` confirms what Shelf installed is intact: config, provenance, dependencies, and imports. It lists what you changed, fails on leftover conflict markers, and names the file and the command that fixes each failure. Your own TypeScript, lint, tests, and build keep covering the code.

To stop using Shelf, delete `shelf.config.json`, `.shelf/`, and the `@shelfui/cli` package. The components keep working, because they are your code.

---

## For system teams

A **registry** is a folder of JSON and source: `index.json`, then one folder per item with a `registry.json`. No database, no service.

```bash
shelf build registry --out dist/registry   # validate and write every past revision
shelf serve dist/registry                  # or upload to any static host
```

- **Revisions** are hashes of an item's files and dependencies, so there is nothing to bump by hand. `build` keeps every revision from git history, so a product can always recover the exact version it installed.
- **Private registries** take request headers from environment variables, such as `${SHELF_REGISTRY_TOKEN}`, sent only over HTTPS.
- **The registry site.** The same build is a browsable site: every item with its source, revisions, Storybook previews, and where it is used.
- **Usage.** `shelf usage` reads each project's lock and imports and reports which items it installed, which it imports, which are out of date, and which it changed. Point it at directories, cloned repos (`--repo`), or every repo in a GitHub organization (`--github acme`). `--json` writes the whole graph for the registry site.

---

## For agents

Agents read and change the actual component file instead of wrapping a package. Every command has short, stable output and no prompts, and a failing `shelf check` names the file and what to run.

`shelf search` ranks by name, then keywords, then description and "use when" notes, and each result carries `useWhen`, `avoidWhen`, and `related` items, so an agent can choose between a Dialog and a Confirm Dialog without opening either. Higher-level items (templates, blocks, patterns) come first on a tie.

Add this to your `AGENTS.md` or rules file:

> Search Shelf with `shelf search` before creating UI, add what exists with `shelf add`, and run `shelf check` before finishing.

The registry site also serves `llms.txt`, which lists every item and links its `registry.json`.

---

## What's in the registry

- **105 components**: Button, Dialog, Select, Combobox, Data Table, Sidebar, Toast, and more.
- **1 pattern**: an interaction built from components. Confirm Dialog asks before a hard-to-undo action, shows a pending state, and keeps the error in the dialog.
- **13 blocks**: finished pieces of a page, such as a login form, a settings section, or a dashboard shell. A block installs the components it uses.
- **2 templates**: page-level starting points, a settings page and a list and detail page. A template installs the blocks, patterns, and components it uses.
- **Foundations**: semantic StyleX tokens for color, typography, spacing, radius, elevation, and motion, with light and dark themes and presets.
- **Icons**: one `icons.tsx` file of named wrappers. Swap the icon library by editing that file.

Every component has Storybook stories with accessibility checks, and a live demo on the website.

---

## The stack

- **React** is the source of truth.
- **[Base UI](https://base-ui.com)** provides accessible interaction: focus, keyboard, overlays, and ARIA.
- **[StyleX](https://stylexjs.com)** compiles typed, static styles to atomic CSS at build time.

A project needs React with StyleX in its build. The example app uses Vite with `@stylexjs/unplugin`, and the website uses Next. The CLI needs Node 20.12 or newer and git, and works with npm, pnpm, yarn, and Bun.

---

## Status

**Available:** components, blocks, foundations and themes, and `init`, `search`, `add`, `status`, `diff`, `update`, `check`, `usage`, `build`, and `serve`. Private registries and the registry site.

**Also available:** an optional Figma plugin that builds a native library (variables, styles, components with variants) from the registry and syncs changes. Designers can also work in the real components without Figma.

**Planned:** `shelf contribute` to send a local improvement back to the registry, more patterns and templates, and visual validation in `shelf check`.

Shelf grows through real product use, so this list moves when something proves itself.

---

## Repository

```text
registry/        Shelf items: components, patterns, blocks, templates, foundations, lib. What shelf add installs.
packages/cli/    the @shelfui/cli CLI (see its README for every command and option)
apps/example/    a minimal Vite app that receives Button and Dialog through shelf add
apps/web/        the website and docs, a Next app that receives every component through shelf add
apps/registry/   the registry site that shelf build publishes
examples/acme/   a multi-project example used for the shelf usage demo
.storybook/      Storybook for registry items
```

`apps/example` and `apps/web` behave like external projects: they never import from `registry/` or `packages/`, and components enter them only through `shelf add`.

### Development

Shelf uses [Bun](https://bun.sh).

```bash
bun install
bunx playwright install chromium
bun run check            # typecheck, lint, format, tests, Storybook with accessibility
```

| Command | What it does |
| --- | --- |
| `bun run storybook` | Storybook on port 6006 |
| `bun run registry:build` | Build the registry into `dist/registry` |
| `bun run registry:serve` | Serve `registry/` locally |
| `bun run site:build` | Build the registry site into the CLI package |
| `bun install --cwd apps/web && bun run --cwd apps/web dev` | Run the website |

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before changing code, [`PROJECT.md`](PROJECT.md) for the architecture, and [`AGENTS.md`](AGENTS.md) for the engineering rules.

## License

[MIT](LICENSE). Components you install with `shelf add` become your source under the same terms.

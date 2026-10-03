# @shelfui/cli

The Shelf CLI copies React components into your app as normal source, installs the packages they need, and records where each file came from. After `shelf add`, the code is yours: edit it, and `shelf check` tells you what changed and whether what Shelf installed is still intact.

Requires Node 20.12 or newer, and git for merges. It works with npm, pnpm, yarn, and Bun, and installs packages with the one your project uses: the `packageManager` field in package.json, else the lockfile. Components use React, [Base UI](https://base-ui.com), and [StyleX](https://stylexjs.com), compiled with Vite and `@stylexjs/unplugin`.

## Start

```sh
npm install -D @shelfui/cli          # or: pnpm add -D, yarn add -D, bun add -d
npx shelf init --registry <path-or-url>
npx shelf add button dialog
npx shelf check
```

The package is `@shelfui/cli` and its command is `shelf`. Run it through your package manager (`npx shelf`, `pnpm shelf`, `yarn shelf`, `bunx shelf`) once it is installed: the npm package named `shelf` is unrelated.

`init` writes `shelf.config.json` and `.shelf/lock.json`. If your `tsconfig.json` (or `tsconfig.app.json`) declares `compilerOptions.paths` such as `"@/*": ["./src/*"]`, `init` copies them into `aliases`, so installed components import `@/styles/shelf/tokens.stylex` the way your app does. It warns when the StyleX Vite plugin is missing. There is no default registry yet, so `--registry` (or `SHELF_REGISTRY`) is required.

## Commands

| Command | What it does |
| --- | --- |
| `shelf init --registry <location>` | Create `shelf.config.json` and `.shelf/` |
| `shelf search [query...]` | List registry items matching every term |
| `shelf add <items...>` | Copy items and their Shelf dependencies, install packages, record provenance |
| `shelf status [items...]` | Which installed items you changed and which have a newer version |
| `shelf diff <item> [--local]` | Shelf's changes since you installed an item, or yours with `--local` |
| `shelf update [items...]` | Update items with a newer version, merging Shelf's changes into yours |
| `shelf check [--only <steps>]` | Config, provenance, dependencies, and imports of installed items; exits 1 on failure |
| `shelf usage [dirs...]` | Where installed items are used, across projects and repos (`--repo`, `--github`, `--json`) |
| `shelf build [dir] --out <dir>` | Validate a registry and write the files that install, plus the Shelf Registry site, for static hosting |
| `shelf serve [dir] --port <port>` | Serve a registry directory on 127.0.0.1 |

`shelf add` and `shelf update` keep files you changed. When Shelf changed one too, they merge its changes into yours with `git merge-file`, and leave conflict markers (`<<<<<<< yours` … `>>>>>>> shelf`) where you both changed the same lines; `shelf check` fails until they are resolved. Every merge is computed before anything is written. Pass `--overwrite` to take the registry's version instead. `--skip-install` leaves packages to you.

Every command takes `--cwd <dir>` and `--help`.

## Configuration

`shelf.config.json`:

```json
{
  "$schema": "./node_modules/@shelfui/cli/schema.json",
  "registry": "https://example.com/registry",
  "paths": {
    "components": "src/components/ui",
    "foundations": "src/styles/shelf",
    "lib": "src/lib/shelf"
  },
  "aliases": {
    "@/*": "src/*"
  }
}
```

- `$schema` gives your editor autocomplete and validation. It resolves once `@shelfui/cli` is a dev dependency (`npm install -D @shelfui/cli`), and then matches the installed version. Unknown keys are an error, so typos don't pass silently.
- `registry` is a directory, relative to this file, or an http(s) URL. For a private registry, see below.
- `paths` sets where each kind of item is copied. Paths are relative to the project and default to the values above.
- `aliases` is optional and uses the same form as `compilerOptions.paths` in `tsconfig.json`. Without it, imports between installed files are relative (`../../styles/shelf/tokens.stylex`), which works with no extra setup. With it, imports that cross directories use the alias (`@/styles/shelf/tokens.stylex`). Your `tsconfig.json` and bundler must resolve the same alias.

### Private registries

```json
{
  "registry": {
    "url": "https://ui.example.com/registry",
    "headers": { "Authorization": "Bearer ${SHELF_REGISTRY_TOKEN}" }
  }
}
```

Or: `shelf init --registry https://ui.example.com/registry --header 'Authorization: Bearer ${SHELF_REGISTRY_TOKEN}'`.

- `${VAR}` is read from the environment, then `.env.local`, then `.env`. A missing variable fails before any request. The lock records only the URL.
- Headers are sent only over HTTPS, except to localhost, and redirects are followed only within the same origin.
- A 401 or 403 shows the server's message. Header values are never printed.

## Provenance

`.shelf/lock.json` records, for every installed item, its registry revision and a hash of each file as installed. Commit it: it is how `shelf check` reports local changes, how `shelf status` finds updates, and how `shelf update` knows what is safe to replace and what to merge.

Nothing else is copied. When Shelf needs a file as it was installed (BASE), it takes the first match for its hash: the file itself if unchanged, your git history, or the registry's `revisions/`, rebuilt the way `add` wrote it. Its limits:

- A file edited before its first commit, whose aliases or dependencies changed since, can't be rebuilt. Commit right after `shelf add`.
- A registry whose published git history is rewritten loses the revisions that only lived there, unless its host kept `revisions/`.
- `build` reads the registry's first-parent history, so a revision that only existed on a merged branch isn't published. The merged result is.

Older versions of Shelf kept copies in `.shelf/base/`. The next `shelf add` removes that folder.

Removing Shelf is deleting `shelf.config.json`, `.shelf/`, and this package. The components keep working.

## Hosting a registry

```sh
shelf build registry --out dist/registry
shelf serve dist/registry
```

`build` checks every item the way `add` reads it, including that its imports resolve to its own files or its Shelf dependencies, and copies only installable files: no stories or tests. Upload the output to any static host and point `registry` at its URL.

It also writes `revisions/<revision>.json` for every revision in the registry's git history, and never deletes that folder on a rebuild. Build from a full clone (`fetch-depth: 0` on GitHub Actions); a shallow clone only has current revisions, and `build` says so.

The output is also the Shelf Registry site: open it in a browser to browse items, their source and revisions, and where they are used. `llms.txt` lists every item for agents.

```sh
shelf usage apps --registry registry --json > usage.json
shelf build registry --out dist/registry --storybook storybook-static --usage usage.json
```

`--storybook` serves a Storybook build at `storybook/` for previews, `--usage` serves `shelf usage --json` output at `usage.json`, `--verify` serves a `bun run verify` report at `verify.json` (what each item weighs and has been checked for), and `--no-site` writes only the files that install. `usage.json` contains file paths and repository URLs; host it privately when it covers private code.

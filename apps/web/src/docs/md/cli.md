---
title: CLI
description: Every Shelf command, its options, and shelf.config.json.
---

# CLI

Install `@shelfui/cli` as a dev dependency, then run `shelf` through your package manager, such as `npx shelf add button`. Every command takes `--cwd <dir>` and `--help`, and none of them prompt. `search`, `status`, `check` and `diff` take `--json` for machine-readable output.

```bash
npm install -D @shelfui/cli
```

## Commands

- `init --registry <location>`: Create shelf.config.json and .shelf/, copy path aliases from tsconfig.json, and write agent instructions (AGENTS.md block and a skill). `--no-agents` skips the agent files.
- `search [query...]`: List registry items that match every term. `--registry` searches another registry than the configured one, and works before init.
- `add <items...>`: Copy items and the Shelf items they build on, install their packages, and record provenance. Keeps files you changed, and merges Shelf's changes into them when both changed.
- `status [items...]`: List installed items, which ones you changed, and which have a newer version. Read-only. With `--json` it also reports the project: package manager, paths, aliases, and the registry.
- `diff <item> [--local]`: Show what an update would bring, as a unified diff from what you installed. `--local` shows your changes instead.
- `update [items...]`: Update every item with a newer version, or the ones named, merging Shelf's changes into files you changed. Takes the same options as add.
- `check [--only <steps>]`: Check that installed files, their Shelf and package dependencies, and their imports are intact, and list what you changed. Exits 1 on failure. Each step lists its first 30 details; `--verbose` lists them all.
- `docs [topic]`: Print documentation as markdown for a topic such as `install`, `ownership`, `cli` or `agents`, or for a component such as `button`. With no topic, list what is available. Reads the registry, so it matches the version you install.
- `usage [dirs...]`: Show where installed items are used: which each project imports, which are out of date or changed, and which come through a shared package. `--repo` adds other repositories, `--github` adds every Shelf repository in a GitHub organization, and `--json` writes the graph.
- `build [dir] --out <dir>`: Validate a registry and write the files that install, every revision in its git history, and the Shelf Registry site, for static hosting. `--storybook` and `--usage` add previews and usage; `--no-site` leaves the site out.
- `serve [dir] --port <port>`: Serve a registry directory on 127.0.0.1.

## JSON output

`--json` prints one JSON object to stdout and nothing else. Exit codes are the same as without it: 0 on success, 1 when a check fails or a command cannot finish.

```text
shelf search <query> --json
{ "query": string, "items": [{ "name", "type", "description" }] }

shelf status --json
{ "project": { "packageManager", "registry", "paths", "aliases" },
  "items": [{ "name", "state", "files": [{ "path", "state" }] }],
  "summary": { "updates": number, "modified": number } }

shelf check --json
{ "ok": boolean,
  "steps": [{ "name", "ok", "problems": [{ "file", "problem", "fix" }], "notes": [...] }] }

shelf diff <item> --json
{ "item", "mode": "upstream" | "local", "files": [{ "path", "state", "diff" }] }
```

## Options for init

- `--header <header>`: A request header for a private http(s) registry, such as 'Authorization: Bearer ${SHELF_REGISTRY_TOKEN}'. Repeatable. Quote it so the variable is written as-is and expanded only when Shelf makes a request.
- `--no-agents`: Do not write the AGENTS.md block or the agent skill.

## Options for add and update

- `--overwrite`: Replace locally modified files, or files Shelf didn't install, with the registry's version instead of merging.
- `--skip-install`: Copy files and record provenance, but leave package installs to you.

## Configuration

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

- `registry`: A directory, relative to this file, or an http(s) URL. For a private registry, an object with url and headers.
- `paths`: Where each kind of item is copied, relative to the project.
- `aliases`: Optional, in the same form as compilerOptions.paths. Without it, imports between installed files are relative.
- `$schema`: Autocomplete and validation in your editor. Unknown keys are an error, so typos don't pass silently.

## Hosting a registry

```bash
shelf build registry --out dist/registry
shelf serve dist/registry
```

`build` checks every item the way `add` reads it, including that its imports resolve, and leaves out stories and tests. Upload the output to any static host and point `registry` at its URL.

It also writes `revisions/`, one snapshot for every revision the items have had in git, and never deletes it. That is how a product gets back the exact files it installed. Build from a full clone; a shallow one only has current revisions, and `build` says so.

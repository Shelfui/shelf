# Contributing to Shelf

Read [`PROJECT.md`](PROJECT.md) for the architecture and [`AGENTS.md`](AGENTS.md) for the engineering rules. Both apply to humans and agents.

## Setup

Shelf uses [Bun](https://bun.sh) only.

```bash
bun install
bunx playwright install chromium
bun run check
```

`bun run check` is the single validation entrypoint. It must pass before a change is merged. Do not disable a check to get a green result; fix the underlying issue.

## Repository layout

```text
registry/            Shelf items (source of truth for what `shelf add` installs)
packages/cli/        the `@shelfui/cli` CLI (init, search, add, status, diff, update, check, usage, build, serve)
apps/example/        a minimal Vite app that receives Button and Dialog via `shelf add`; the e2e tests drive it
apps/web/            the website, a Next.js app that receives every component via `shelf add`
apps/registry/       the registry site that `shelf build` publishes
examples/acme/       a multi-project example for the `shelf usage` demo
.storybook/          Storybook for registry items
```

## CLI structure

The CLI is built on [Commander](https://github.com/tj/commander.js) with typed options from `@commander-js/extra-typings`.

```text
packages/cli/src/
  index.ts           bin entry: run(argv), set the exit code
  cli/program.ts     the root command, global --cwd, help and error configuration
  cli/errors.ts      the only place that turns errors into output and exit codes
  cli/commands/      one file per command: arguments, options, one call into core/
  core/              the behavior (registry, resolve, add, provenance, check); no Commander
```

Commander appears only in `cli/`. A command module parses input and calls one `core/` function. Tests exercise `core/` directly, and `cli.test.ts` covers help, usage errors, and exit codes. User-facing failures throw `ShelfError` with a message that says how to fix the problem.

## Adding a component

1. Confirm it is required by a real use case.
2. Check whether Base UI already provides the behavior.
3. Check whether Shelf already provides the concept (`shelf search`).
4. Add `registry/components/<name>/` with the source, `registry.json`, and `<name>.stories.tsx`.
5. Add the item to `registry/index.json`.
6. Add stories for the meaningful states, with play functions for behavior. Accessibility checks run on every story.
7. Run `bun run check`.

## Writing styles

Shelf components use StyleX the way it is designed to be used: every style is static, so it compiles to atomic CSS with no runtime work.

- **Scales are tokens.** Spacing, sizes, radius, and colors come from `defineVars` in `tokens.stylex.ts`: `spacing["2.5"]`, `sizes.controlSm`, `colors.muted`. Fixed values that must not be themed, such as media queries and layers, come from `defineConsts`.
- **One-offs are literals.** Write `"100%"` or a local constant. Don't call helper functions inside `stylex.create`, because StyleX can't evaluate them at compile time.
- **Dynamic styles are for runtime values only.** A style function such as `(x) => ({ width: x })` sets CSS variables through inline styles on every render. Use one only when the value is truly unknown until runtime, such as a drag position.
- **Components accept `style`, not `className`.** Callers pass StyleX styles, which merge predictably. Don't mix in outside class names or StyleX's internal `$$css` marker.
- **Parent state goes through markers.** Style a child by its parent's state with `stylex.defaultMarker()` and `stylex.when.ancestor(...)`, not descendant selectors or `cloneElement`.
- **Dark mode is a theme.** Components use semantic tokens and let `createTheme` switch them; they never check `prefers-color-scheme` themselves.
- **Transitions name their properties.** List what actually changes, such as `"background-color, box-shadow"`, never `"all"`. Prefer `opacity` and `transform`. Animate `height` or `width` only where Base UI supplies the size, such as `--accordion-panel-height`. Every duration drops to `0s` under `media.reducedMotion`.
- **Hover is for pointers.** Nest `:hover` under `media.hover` so touch devices don't get stuck hover states.

## The external-consumer rule

`apps/example` and `apps/web` must behave like external projects. They are not workspace members and must never import from `registry/` or `packages/`. Components enter them only through `shelf add`.

# Shelf

**The design system every product owns.**

Start with shared components, then make them yours. Shelf puts the source in every product and tracks every copy, so teams and agents move fast without leaving the system behind.

```bash
npm install -D @shelfui/cli
npx shelf init
npx shelf add button dialog
```

Shelf is open source and in early preview.

## Learn more

- [Installation](https://shelfui.dev/docs/installation)
- [Components](https://shelfui.dev/docs/components)
- [Ownership and updates](https://shelfui.dev/docs/ownership)
- [CLI reference](https://shelfui.dev/docs/cli)
- [Running a registry](https://shelfui.dev/docs/registry)
- [Agents](https://shelfui.dev/docs/agents)
- [Figma](https://shelfui.dev/docs/figma)
- [Philosophy](https://shelfui.dev/docs/philosophy) and [roadmap](https://shelfui.dev/docs/roadmap)

## Repository

```text
registry/        Shelf items: components, patterns, blocks, templates, foundations
packages/cli/    the @shelfui/cli CLI
packages/figma/  the Figma plugin, capture, and Design IR
skills/shelf/    the agent skill that shelf init installs
apps/example/    a minimal Vite app that receives items through shelf add
apps/web/        the website and docs
apps/registry/   the registry site that shelf build publishes
```

## Development

Shelf uses [Bun](https://bun.sh).

```bash
bun install
bunx playwright install chromium
bun run check
```

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before changing code, [`PROJECT.md`](PROJECT.md) for the architecture, and [`AGENTS.md`](AGENTS.md) for the engineering rules.

## License

[MIT](LICENSE). Components you install with `shelf add` become your source under the same terms.

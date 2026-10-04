# Shelf UI

> Take what you need. Own the source.

Shelf UI is an open-source, source-owned interface system for modern product teams.

It provides high-quality React components, patterns, and blocks that are installed directly into an application's source code rather than consumed through a centralized component package.

Shelf is designed for three first-class users:

1. Engineers
2. Designers
3. Coding agents

The initial stack is intentionally opinionated:

- Bun
- React
- TypeScript
- Base UI
- StyleX
- Storybook

Shelf is built on source ownership, and owns its own:

- component implementations
- registry
- CLI
- provenance model
- source lifecycle
- design integration
- agent workflow
- validation

The goal is not to build another component package.

The goal is to build a modern interface system where:

> The organization owns the interface language.  
> The product owns the implementation.

---

# 1. Core thesis

Traditional design systems commonly distribute implementation through a centralized dependency:

```text
Design system
      ↓
@company/ui
      ↓
Product
```

This provides consistency and centralized maintenance, but it also means product teams depend on a shared abstraction.

When the abstraction does not fit a product requirement, the normal path becomes:

```text
product requirement
      ↓
shared component change
      ↓
central review
      ↓
release
      ↓
consumer upgrade
      ↓
product ships
```

Shelf uses a different model:

```text
Shelf
  ↓
excellent starting source
  ↓
product repository
  ↓
product owns implementation
```

The shared system provides:

- foundations
- excellent defaults
- accessible behavior
- patterns
- knowledge
- validation
- upstream improvements

The product owns:

- installed source
- product-specific modifications
- product-specific composition

The intended model is:

> Start together. Diverge intentionally. Converge when something proves reusable.

---

# 2. Production source of truth

React is the production source of truth.

React owns:

- implementation
- behavior
- component API
- accessibility implementation
- DOM structure
- styling
- composition

Storybook describes meaningful production states and examples.

Figma is:

- the design exploration environment
- the native representation of production Shelf components for designers

Production Figma components should be generated from the production implementation rather than maintained as a second independent component implementation.

The model is:

```text
Design exploration
      ↓
    Figma

Production implementation
      ↓
    React
      ↓
  Storybook
      ↓
    Shelf
      ↓
    Figma
```

New ideas may originate in Figma.

Once something becomes production system UI, React becomes canonical.

---

# 3. Source ownership

Shelf distributes source.

Example:

```bash
shelf add dialog
```

produces normal application files:

```text
src/components/ui/
├── dialog.tsx
└── dialog.styles.ts
```

The consuming application owns those files.

It may:

- read them
- modify them
- refactor them
- remove them

Shelf should not require a component runtime package for product-facing component implementations.

Shared infrastructure dependencies are allowed and expected.

Examples:

- Base UI
- StyleX
- chart engines
- icon infrastructure

---

# 4. Stay connected

Source ownership must not mean abandoned copies.

Shelf records exactly what it installs.

Shelf should eventually understand three representations of every installed item:

```text
BASE
what Shelf originally installed

LOCAL
what the product currently has

UPSTREAM
what Shelf currently provides
```

This model enables:

```text
shelf status
shelf diff
shelf update
shelf contribute
```

The long-term goal is:

> Local ownership with upstream awareness.

Shelf should make divergence visible and manageable.

Shelf does not attempt to prevent all divergence.

---

# 5. Technology

## Runtime

React.

## Language

TypeScript.

Use strict TypeScript.

Prefer simple, understandable types.

Avoid type-level frameworks and unnecessary generic abstractions.

## Tooling

Bun.

Use Bun for:

- package management
- workspaces
- scripts
- CLI execution
- tests where practical

Typical commands:

```bash
bun install
bun run dev
bun run check
bun test
```

Do not introduce another package manager.

Start with Bun workspaces.

Do not introduce Turborepo or another orchestration layer until repository size demonstrates a concrete need.

---

# 6. Base UI

Base UI is the default behavioral primitive layer.

Use Base UI for interaction models such as:

- Dialog
- Menu
- Popover
- Tooltip
- Select
- Checkbox
- Switch
- Autocomplete
- Combobox

Base UI should own difficult behavioral concerns:

- focus management
- keyboard navigation
- ARIA interaction semantics
- dismissal behavior
- selection behavior
- overlay mechanics

Shelf owns:

- component composition
- component API
- visual treatment
- product conventions
- examples
- patterns

Do not wrap Base UI simply to create a Shelf wrapper.

Add a Shelf abstraction only when Shelf adds a meaningful product/design opinion.

---

# 7. StyleX

StyleX is the default styling system.

Shelf uses StyleX for:

- static CSS extraction
- component styling
- semantic variables
- themes
- deterministic composition
- typed style boundaries

Do not use:

- styled-components
- Emotion
- Tailwind
- runtime CSS-in-JS

in the initial reference implementation.

Do not create a generic styling-provider abstraction in V0.

StyleX is the implementation until a real second implementation exists.

---

# 8. Foundations

Shelf should provide a small semantic foundation.

Initial categories:

```text
color
typography
spacing
radius
elevation
motion
```

Components should use semantic values where appropriate.

Prefer:

```text
surface
surfaceRaised

textPrimary
textSecondary
textMuted

border
borderSubtle

interactive
interactiveHover

critical
success
warning

focusRing
```

rather than raw palette values in component implementations.

Do not design a comprehensive token taxonomy before actual components require it.

---

# 9. Themes

Themes are expressed through semantic StyleX variables.

Components should not contain theme conditionals such as:

```ts
isDark ? valueA : valueB
```

Instead:

```text
semantic variables
        ↓
    theme values
        ↓
     components
```

V0 should support:

```text
light
dark
```

Do not add density, brand matrices, high-contrast variants, or other theme dimensions until real requirements appear.

---

# 10. Shelf hierarchy

Shelf organizes reusable UI into:

```text
Foundations
    ↓
Components
    ↓
Patterns
    ↓
Blocks
    ↓
Templates
```

## Components

Small reusable elements.

Examples:

```text
Button
Input
Checkbox
Dialog
Menu
Popover
Tooltip
Select
```

## Patterns

Opinionated compositions and interaction patterns.

Examples:

```text
FormField
EmptyState
SettingsSection
SearchField
ConfirmationDialog
CommandPalette
```

## Blocks

Product-sized reusable compositions.

Examples:

```text
SettingsPanel
ApprovalFlow
FilterPanel
DataTable
OnboardingStep
```

## Templates

Page-level starting points.

Examples:

```text
SettingsPage
DetailPage
AdministrationPage
```

Higher-level Shelf items should compose lower-level Shelf items.

Agents should prefer the highest-level appropriate abstraction already available.

---

# 11. Repository

Start with:

```text
shelf-ui/
├── apps/
│   ├── web/
│   └── storybook/
│
├── packages/
│   ├── cli/
│   ├── core/
│   ├── foundations/
│   └── test-utils/
│
├── registry/
│   ├── components/
│   ├── patterns/
│   ├── blocks/
│   └── templates/
│
├── AGENTS.md
├── PROJECT.md
├── README.md
├── bunfig.toml
├── package.json
├── shelf.config.json
└── tsconfig.json
```

Do not create empty packages simply to satisfy this tree.

Create directories only when they become useful.

---

# 12. Registry

Shelf owns its registry model.

Do not depend on a third-party registry protocol.

Keep the strengths of source-ownership registries:

- source ownership
- simple installation
- clear manifests
- dependency resolution
- excellent developer experience

but keep Shelf's model independent.

The initial registry must remain extremely small.

A registry item initially needs:

```text
name
type
description
revision
files
package dependencies
Shelf dependencies
```

Prefer a portable data format such as JSON.

Example:

```json
{
  "name": "dialog",
  "type": "component",
  "description": "A modal surface for focused tasks and decisions.",
  "revision": "abc123",
  "files": [
    "dialog.tsx",
    "dialog.styles.ts"
  ],
  "dependencies": [
    "@base-ui/react",
    "@stylexjs/stylex"
  ],
  "shelfDependencies": [
    "button"
  ]
}
```

Figma links live once in the registry's `index.json`, as the Shelf Figma plugin prints them after a sync:

```json
"figma": {
  "file": "https://www.figma.com/design/<key>/<name>",
  "nodes": { "button": "4:47" }
}
```

`shelf build` publishes each item's link, shown on the registry site. Links are not installed and do not change revisions.

`index.json` entries may also carry `keywords`, `useWhen`, `avoidWhen`, and `related`. They help people and agents choose between items, are read by `shelf search`, `shelf docs`, and `llms.txt`, and are not part of an item's revision.

This is illustrative.

Do not freeze the entire future schema now.

Do not introduce helper APIs or registry DSLs merely for aesthetics.

---

# 13. Registry item source

Keep component directories obvious.

Example:

```text
registry/components/dialog/
├── dialog.tsx
├── dialog.styles.ts
├── dialog.stories.tsx
├── dialog.test.tsx
└── registry.json
```

Opening this directory should be sufficient to understand the implementation.

Avoid generated indirection.

---

# 14. Distribution

The primary workflow is:

```bash
shelf add dialog
```

V0 only needs to support:

- React
- Bun
- the Shelf reference stack
- local or HTTP Shelf registries

The command should:

1. resolve the registry entry
2. resolve Shelf dependencies
3. resolve npm package dependencies
4. download/copy source files
5. map supported source paths
6. install required package dependencies
7. record provenance

Do not build a generalized package manager.

Do not support multiple frameworks or package managers in V0.

## Private registries

A project uses one registry. A private one takes request headers:

```json
{
  "registry": {
    "url": "https://ui.example.com/registry",
    "headers": { "Authorization": "Bearer ${SHELF_REGISTRY_TOKEN}" }
  }
}
```

- `${VAR}` expands at request time from the environment, then `.env.local`, then `.env`. The config holds references, never secrets, and the lock records only the URL.
- Headers are sent only over HTTPS, except to localhost.
- With headers, redirects are followed only within the same origin, because `fetch` would forward custom headers across origins.
- A 401 or 403 shows the server's message, sanitized, and what to check. Header values are never printed.

## Shelf Registry

The direction for a company adopting Shelf: one static folder, built by `shelf build`, is where every interface question starts. It is served from any static host, such as GitHub Pages, and needs no Shelf service.

```text
dist/registry/
├── index.json, <item>/registry.json, <item>/<files>   what shelf add installs
├── revisions/                                        every past revision, for provenance
├── history.json                                      revision → commit and date
├── index.html, _site/                                the Shelf Registry site
├── storybook/                                        previews, from --storybook
├── usage.json                                        shelf usage --json, from --usage
└── llms.txt                                          the catalog for agents
```

Pillars, in order:

1. **Install endpoint.** The folder `shelf add` reads. Already shipped.
2. **Catalog.** Every item with source, revisions, dependencies both ways, and Storybook previews. The site reads the same files `shelf add` installs, so the catalog cannot drift from what installs.
3. **Usage.** `shelf usage` reads locks and imports from git, across a monorepo and other repositories (`--repo`, or `--github <org>` to find every repository with a `shelf.config.json`), and credits apps that use items through shared workspace packages. Projects are named `namespace/name` with `"project"` in `shelf.config.json`. Output is deterministic JSON.
4. **Agents.** `llms.txt` and the JSON files let an agent find an existing item before writing new UI.

Later, only when real use asks for them:

- **Governance.** Policies over usage data, such as flagging items that are several revisions behind or modified in many projects.
- **Design parity.** Which items have a Figma component compiled from the current revision.
- **Health.** Trends over successive `usage.json` builds.

Constraints:

- The site is a Shelf consumer (`apps/registry`) built with Shelf components installed by `shelf add`. It is prebuilt into the CLI package and copied by `shelf build`, so companies don't build it themselves.
- Everything is static and read from relative URLs, so it works under any base path.
- `usage.json` contains file paths and repository URLs. Private code means a private host.

---

# 15. Provenance

Provenance is a V0 requirement.

Every installed item must preserve its installed base (BASE), exactly, so a future three-way comparison of BASE, LOCAL, and UPSTREAM is always possible.

Shelf records BASE by content, not by copy. Consumers keep no copies of installed files.

## What the lock records

`.shelf/lock.json` is committed. For every installed item:

```json
{
  "button": {
    "type": "component",
    "registry": "../../registry",
    "path": "components/button",
    "revision": "f79cc395084a…",
    "installedAt": "...",
    "dependencies": { "@base-ui/react": "^1.8.0" },
    "shelfDependencies": ["foundations", "utils"],
    "files": {
      "src/components/ui/button.tsx": { "source": "button.tsx", "baseHash": "a8357131844f…" }
    }
  }
}
```

- `revision` is a sha256 of what installs from the registry: name, type, dependencies, Shelf dependencies, and the raw files (`computeRevision`).
- `baseHash` is a sha256 of the exact bytes written to the project, after import rewriting.

Both are content addresses. Nothing else is needed to identify BASE.

## What the hashes answer on their own

`shelf add`, `shelf update`, and `shelf check` need BASE bytes only for a merge:

| LOCAL vs BASE | UPSTREAM vs BASE | `shelf add` / `shelf update` |
| --- | --- | --- |
| same | same | nothing to do |
| same | changed | take UPSTREAM |
| changed | same | keep LOCAL |
| changed | changed | merge (`--overwrite` takes UPSTREAM) |

`shelf check` reports LOCAL vs `baseHash`, and fails on unresolved conflict markers. It stays offline and deterministic.

## Merging

When LOCAL and UPSTREAM both changed, Shelf recovers BASE and runs `git merge-file -p -L yours -L base -L shelf LOCAL BASE UPSTREAM`. There is no custom merge engine.

- Every merge is computed before any file is written. If one file can't be merged, nothing changes.
- A clean merge writes the result. A conflict writes standard markers (`<<<<<<< yours`, `>>>>>>> shelf`) and reports the count.
- If BASE can't be recovered, the file is refused with the reason. `--overwrite` takes UPSTREAM.
- The lock records UPSTREAM as the new `baseHash`, so a merged file reads as modified locally and the next update merges from there.
- When most of BASE's lines are gone from LOCAL, the file was likely reformatted; Shelf says so and points at `shelf diff <item> --local`. It never runs the project's formatter.
- When an updated item needs a different range of a package the project already declares, Shelf prints the install command. It doesn't change `package.json` itself.

`shelf status` reads each item's `revision` from the published `index.json`, so it makes one request against a built registry.

## Recovering BASE bytes

`readBase(cwd, item)` in `packages/cli/src/core/base.ts` returns BASE for every file of an item. It tries, in order, and accepts only bytes whose sha256 equals `baseHash`:

1. The file itself, if unmodified.
2. The project's git history: the staged version, then every commit that touched the path. The usual flow, `shelf add` then commit, makes this exact and offline.
3. The item's revision in the registry:
   - `revisions/<revision>.json` from a built registry (local directory or HTTP),
   - else, for a local registry directory, the current item if its revision matches, or the registry's git history.

   The snapshot is verified by recomputing its revision. BASE is then rebuilt with the same `installedContent` function `shelf add` uses, the install layout from the lock, and the current `aliases`, and checked against `baseHash`.

If nothing matches, `readBase` fails with the reason. It never returns a guess.

This order means the only operation that needs the registry for BASE, an update that merges, is one that needs the registry for UPSTREAM anyway.

## Registry revisions

A registry must be able to return every revision it has published.

- `shelf build` writes `revisions/<revision>.json` for every current item and every revision on the registry directory's first-parent git history. Snapshots are write-once, and `build` never deletes `revisions/`.
- The history walk is one `git log --name-only` and one `git cat-file --batch` process. An item is read only at the commits that change its directory or its index entry, so cost grows with item changes, not commits × items.
- A shallow clone or a directory outside git gets a one-line warning, and only current revisions are written.

No code is specific to a git host.

## Limits

- A file edited before its first commit cannot be rebuilt if `aliases` or an installed dependency's layout changed since install.
- Revisions that only existed on commits of a merged branch, not on the first-parent history, are not published. The merged result is.
- Rewriting a registry's published git history drops the revisions that only lived there, unless its host kept `revisions/`.

The lock schema is not frozen.

---

# 16. Source lifecycle

Shelf's intended lifecycle is:

```text
ADD
 ↓
OWN
 ↓
MODIFY
 ↓
CHECK
 ↓
UPDATE
 ↓
CONTRIBUTE
```

V0 implements:

```text
ADD
OWN
MODIFY
CHECK
STATUS
DIFF
UPDATE
```

Future work includes:

```text
CONTRIBUTE
```

Do not implement future lifecycle features until installation, provenance, and updates are excellent.

---

# 17. CLI

Initial commands:

```bash
shelf init
shelf search
shelf add
shelf status
shelf diff
shelf update
shelf check
```

Future:

```bash
shelf contribute
shelf figma
shelf visual
shelf eval
```

The CLI should be:

- fast
- predictable
- scriptable
- concise
- visually polished
- understandable by humans
- understandable by agents

Every important workflow should eventually support non-interactive execution.

---

# 18. Init

```bash
shelf init
```

V0 responsibilities:

- create Shelf configuration
- create `.shelf`
- configure component output path
- verify/install StyleX requirements
- configure foundations
- install/update agent instructions if appropriate

Do not make Shelf own the application's architecture.

---

# 19. Search

```bash
shelf search dialog
```

should search:

- components
- patterns
- blocks
- templates

V0 search should be simple and deterministic.

Semantic search may be added later.

---

# 20. Add

Example:

```bash
shelf add button dialog
```

Desired output:

```text
Shelf

Adding button
Adding dialog

✓ resolved dependencies
✓ added 4 files
✓ installed dependencies
✓ recorded provenance

Button and Dialog are now yours.
```

The wording reinforces source ownership.

---

# 21. Check

```bash
shelf check
```

validates only what Shelf controls:

- config: `shelf.config.json` is valid
- provenance: installed files against their BASE hash, and local modifications
- dependencies: every Shelf dependency is installed, and every package is in package.json
- imports: relative and alias imports in installed files still resolve

It does not run TypeScript, lint, formatting, tests, Storybook, or the build. Those belong to the consuming project, and installed components are normal source that the project's own tools already cover. A project puts `shelf check` next to them in its own script.

The Shelf repo validates its registry the same way: `bun run check` runs TypeScript, lint, format, tests, and Storybook with interaction and accessibility tests.

Future:

- visual regression
- source contracts
- agent-oriented validation

Errors should be actionable.

Avoid generic:

```text
Validation failed
```

Prefer:

```text
Dialog / Default

Focus trigger is missing after close.
```

---

# 22. Example consumer

`apps/web`, the website, must behave like an external application.

It must not import Shelf component implementations directly from workspace packages.

Components must enter the consumer through:

```bash
shelf add
```

This is an architectural test.

If Shelf only works because the example lives inside the monorepo, the distribution model has not been validated.

---

# 23. Storybook

Storybook is required from the first component.

Every component should contain meaningful canonical stories.

Stories serve:

- component development
- documentation
- supported state definition
- interaction testing
- accessibility testing
- Figma compilation input
- future visual regression
- agent examples

Avoid exhaustive meaningless combinations.

---

# 24. Own the Figma solution

Shelf should own its code-to-Figma workflow.

This is a core part of the product.

The long-term architecture:

```text
React
  ↓
Storybook
  ↓
Shelf Capture
  ↓
Shelf Design IR
  ↓
Shelf Figma Plugin
  ↓
Native Figma Components
```

React remains canonical.

Do not ask an LLM to visually recreate components.

The conversion pipeline must be deterministic.

---

# 25. Figma capture

Shelf should render canonical Storybook states in a controlled browser.

Capture should extract relevant design information such as:

```text
bounds
layout
padding
gap
fills
borders
radius
typography
opacity
shadows
SVG
text
nested Shelf component identity
```

The initial capture system only needs to support the CSS/layout subset used by Shelf components.

Do not attempt arbitrary-web-page compatibility.

Shelf controls the component stack.

Use that constraint.

---

# 26. Shelf Design IR

The Figma compiler should use an internal intermediate representation.

Conceptually:

```text
Frame
Text
Vector
Image
ComponentInstance
```

Example:

```json
{
  "type": "frame",
  "layout": "horizontal",
  "gap": 8,
  "padding": [8, 12, 8, 12],
  "radius": "control",
  "children": [
    {
      "type": "text",
      "value": "Create"
    }
  ]
}
```

This IR is an internal compiler representation.

It is not a public component DSL.

React remains normal React.

---

# 27. Semantic component identity

Shelf should preserve semantic component boundaries during capture.

A Button containing an Icon should ideally become:

```text
Button
├── Icon instance
└── Label
```

rather than:

```text
Frame
├── Vector
└── Text
```

Shelf may add dev/capture-only annotations such as:

```text
data-shelf-component
data-shelf-variant
data-shelf-size
```

These should not be required in production builds.

---

# 28. Storybook and Figma states

Storybook defines which production states should become design states.

Do not generate the Cartesian product of every prop.

Only meaningful design states should be compiled.

Example:

```text
Button

Variant:
Primary
Secondary
Ghost

Size:
Small
Medium
Large

Disabled:
True / False
```

Runtime-only state does not automatically become a Figma component property.

---

# 29. Figma plugin

Shelf should eventually ship its own Figma plugin.

The plugin should:

- connect to a Shelf build/registry
- discover components
- show synchronization state
- create native Figma components
- update existing generated components
- create component sets
- create properties
- use Auto Layout
- preserve nested instances
- bind semantic variables
- show pending updates

Target designer experience:

```text
Shelf

12 components synced
3 updates available

Button
Dialog
Input
Command Palette

[Review updates]
[Sync all]
```

---

# 30. Designer quality bar

A generated Shelf component must feel like a manually authored, high-quality Figma library component.

Acceptance criteria include:

```text
clean layer hierarchy
meaningful layer names
Auto Layout
component variants
component properties
nested instances
semantic variables
predictable resizing
```

Pixel accuracy alone is insufficient.

The primary acceptance question is:

> Can a designer use this component naturally and forget that it was generated from React?

---

# 31. Figma update workflow

Production Figma masters are generated output.

Do not silently rewrite a designer's library without visibility.

The plugin should eventually show:

```text
Button changed

Radius
6 → 8

Added
Loading state

[Preview]
[Update]
```

Designers should review production library updates before applying them.

---

# 32. Design exploration

Code-first does not mean designers cannot design.

Designers remain free to:

- copy components
- detach instances
- branch files
- create new concepts
- change visual direction
- explore new patterns

The production flow is:

```text
Figma exploration
      ↓
approved direction
      ↓
React implementation
      ↓
Storybook
      ↓
Shelf Figma compile
      ↓
production Figma component
```

---

# 33. Code Connect

Shelf should eventually generate Code Connect mapping where available.

Code Connect is an integration, not a core requirement.

The system should remain useful without it.

When available, the goal is:

```text
Figma Button
      ↓
actual production React usage
```

rather than generic generated HTML/CSS.

---

# 34. Agents

Coding agents are first-class Shelf users.

Agents should be able to understand Shelf from normal repository artifacts:

- source
- registry
- stories
- tests
- documentation
- configuration
- validation

Do not require a proprietary agent service.

---

# 35. Agent discovery

Before creating reusable UI, agents should:

1. search Shelf
2. prefer a template if appropriate
3. otherwise prefer a block
4. otherwise prefer a pattern
5. otherwise prefer a component
6. create new reusable UI only when necessary

This avoids repeated reinvention of the interface language.

---

# 36. Website

The Shelf website is part of the product.

It must be built with Shelf.

Top-level navigation should eventually include:

```text
Docs
Components
Patterns
Blocks
Themes
Figma
Agents
```

Every component page should include:

- live preview
- install command
- source
- examples
- variants
- when to use
- when not to use
- accessibility notes
- Storybook link
- Figma representation

---

# 37. Website distribution model

Every item should make the source workflow obvious.

Example:

```text
Dialog

[Live preview]

bunx @shelfui/cli add dialog

[Copy]
[View source]
[Open in Figma]
```

The website should eventually visualize:

```text
Add
Status
Diff
Update
Contribute
```

using the same underlying lifecycle model as the CLI.

Do not create separate metadata systems for:

- CLI
- docs
- Figma
- agents

---

# 38. Visual regression

Shelf should eventually own its visual regression system.

This is not part of the first vertical slice.

Long-term:

```text
Storybook
   ↓
deterministic render
   ↓
baseline
   ↓
current
   ↓
comparison
```

The system should provide:

- human-readable screenshots/diffs
- machine-readable structured results

---

# 39. Visual analysis

Do not rely only on pixel difference.

Eventually combine:

```text
pixel diff
layout geometry
DOM structure
Shelf identity
token changes
optional vision judgment
```

Example:

```text
Button / Primary

Review required

Horizontal padding increased by 4px.
Height unchanged.
Color unchanged.

Likely source:
controlPaddingInline
```

Avoid subjective design scoring.

---

# 40. Agent visual loop

Long-term:

```text
Agent modifies UI
      ↓
shelf check
      ↓
visual regression
      ↓
structured explanation
      ↓
agent fixes or requests approval
      ↓
check again
```

This should eventually make visual validation part of the agent feedback loop.

---

# 41. Initial components

Start with:

```text
Button
Input
Checkbox
Dialog
Popover
Menu
```

These provide enough surface area to validate:

- simple components
- form behavior
- Base UI integration
- StyleX
- compound APIs
- overlays
- state styling
- source distribution

Do not build a full catalog first.

---

# 42. Initial patterns

After the initial component workflow is solid:

```text
FormField
EmptyState
SettingsSection
CommandPalette
```

CommandPalette is a particularly useful showcase because it exercises:

- Base UI
- keyboard UX
- filtering
- StyleX states
- Storybook
- Figma
- agents

---

# 43. First vertical slice

The first milestone is:

```text
Button
  ↓
Shelf registry
  ↓
shelf add button
  ↓
example consumer
  ↓
local React + StyleX source
  ↓
local modification
  ↓
provenance
  ↓
shelf check
  ↓
Storybook
```

This must feel excellent.

Then repeat with Dialog.

Do not expand Shelf before this works.

---

# 44. First Figma slice

After Button distribution is working:

```text
React Button
    ↓
Storybook
    ↓
Shelf Capture
    ↓
Shelf Design IR
    ↓
Shelf Figma Plugin
    ↓
Native Button component
```

Only support enough layout/styling to make Button excellent.

Then give it to a real designer.

Do not expand the compiler until the designer experience passes the quality bar.

---

# 45. First agent slice

Give a coding agent a clean consumer project and ask:

```text
Build a confirmation dialog using Shelf.
```

The agent should:

1. discover Shelf
2. find Button and Dialog
3. install them
4. compose the interface
5. run `shelf check`
6. correct failures

This validates the agent workflow.

---

# 46. Dogfood

After the first component set works, Shelf should be used in a real product.

Do not continue building infrastructure in isolation.

Real product development should determine:

- missing components
- missing patterns
- CLI improvements
- registry changes
- provenance requirements
- update requirements
- Figma requirements
- agent requirements

---

# 47. V0 non-goals

Do not build:

```text
Shelf cloud
accounts
authentication
organization management
analytics dashboards
plugin marketplace
multi-framework support
multiple styling systems
multiple primitive libraries
custom CSS compiler
custom accessibility primitives
AI UI generation
custom merge engine
full arbitrary HTML → Figma
large component catalog
```

unless actual use demonstrates a need.

---

# 48. Success criteria

The first useful Shelf version succeeds when:

```bash
bunx @shelfui/cli init
bunx @shelfui/cli add button dialog
```

works in an external-style consumer.

Installed source:

- is normal React
- uses Base UI where appropriate
- uses StyleX
- is understandable
- is editable
- records provenance
- passes `shelf check`

Additionally:

- Storybook contains canonical states
- Button compiles into a genuinely usable native Figma component through Shelf's own pipeline
- a coding agent can discover and use Shelf
- a real product ships UI using Shelf

---

# 49. Guiding question

Whenever considering new infrastructure, ask:

> Does this directly make source-owned interface development better for engineers, designers, or agents?

If no:

defer it.

---

# 50. Long-term hypothesis

Shelf is testing a different design-system ownership model.

Traditional:

```text
central team
    ↓
central implementation
    ↓
products consume
```

Shelf:

```text
central foundations
        +
excellent defaults
        +
machine-verifiable guarantees
        ↓
product-owned source
```

The hypothesis is that static styling, accessible primitives, strong tooling, provenance, design compilation, and coding agents make this distributed model practical at company scale.

Shelf should prove or disprove that hypothesis through real product use.

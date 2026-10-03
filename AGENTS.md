# Shelf UI: Agent Instructions

Read `PROJECT.md` before making architectural or cross-cutting changes.

Shelf is an open-source, source-owned React interface system.

The current goal is to prove a small complete workflow, not to implement the entire roadmap described in `PROJECT.md`.

---

# Current stack

Use:

- Bun
- React
- TypeScript
- Base UI
- StyleX
- Storybook

Do not introduce:

- Tailwind
- styled-components
- Emotion
- another package manager
- another primitive library
- another UI framework
- a generic styling abstraction

without explicit instruction.

---

# Primary goal

The first required vertical slice is:

```text
Shelf Button
→ registry
→ shelf add button
→ external-style consumer
→ normal local source
→ provenance
→ local modification
→ shelf check
→ Storybook
```

Then repeat with Dialog.

Do not expand scope until these workflows are excellent.

---

# Engineering style

Prefer:

- simple code
- explicit behavior
- small modules
- normal React
- normal TypeScript
- standards
- boring implementation
- existing infrastructure

Avoid:

- speculative abstractions
- factories without demonstrated value
- custom DSLs
- unnecessary generic layers
- premature plugin architectures
- framework abstractions
- clever type systems

If plain JSON, a normal object, or a normal function solves the problem, prefer it.

---

# React

React source is canonical.

Do not generate React from a Shelf schema.

Do not create a Shelf component language.

Do not hide normal React behind a large framework API.

A Shelf-installed component must remain understandable after Shelf tooling is removed.

---

# Base UI

Use Base UI for complex interaction behavior when an appropriate primitive exists.

Do not hand-roll:

- dialog focus management
- keyboard-driven menu behavior
- overlay dismissal
- select behavior
- autocomplete behavior
- focus restoration
- ARIA interaction models

unless Base UI demonstrably cannot meet the requirement.

Do not wrap a Base UI primitive merely because Shelf needs a wrapper.

Create Shelf abstractions only when they add meaningful API, design, composition, or product semantics.

---

# StyleX

Use StyleX for component styling.

Keep styles statically extractable.

Prefer semantic variables.

Good:

```ts
backgroundColor: colors.surface
color: colors.textPrimary
```

Avoid raw values when an existing semantic value correctly expresses the intent.

Do not:

- introduce runtime CSS-in-JS
- introduce Tailwind
- deeply style child component internals through selectors
- depend on styling-at-a-distance

Prefer explicit composition.

---

# Foundations

Keep foundations small.

Add values when real components need them.

Initial areas:

```text
color
typography
spacing
radius
elevation
motion
```

Do not attempt to design the final company-scale token taxonomy in V0.

---

# Registry

Shelf owns its registry.

The V0 registry should be boring and data-oriented.

Prefer JSON.

Initial registry concepts:

```text
name
type
description
revision
files
dependencies
shelfDependencies
```

Do not introduce:

- registry builders
- `defineX()` helpers
- registry DSLs
- plugin systems
- transformation frameworks

unless actual usage demonstrates a need.

Do not depend on a third-party registry or CLI.

---

# Distribution

`shelf add` must copy normal source into the consuming application.

Do not create a centralized Shelf component runtime.

Shared infrastructure dependencies such as Base UI and StyleX are expected.

V0 distribution only needs to support:

- React
- Bun
- Shelf's reference stack
- local/HTTP Shelf registries

Do not support every package manager or framework.

---

# Provenance

Every installed Shelf item must record provenance.

Never copy files without recording the installed base.

The provenance model must eventually support:

```text
BASE
LOCAL
UPSTREAM
```

comparison.

Merging uses `git merge-file` against the recovered BASE. Do not build a custom merge engine.

Test provenance carefully.

---

# CLI

V0 commands:

```text
shelf init
shelf search
shelf add
shelf status
shelf diff
shelf update
shelf check
shelf docs
```

Do not implement roadmap commands unless explicitly requested.

The CLI should be:

- fast
- deterministic
- concise
- scriptable
- agent-readable

Avoid unnecessary interactive prompts.

---

# `shelf add`

`shelf add` should:

1. resolve the item
2. resolve Shelf dependencies
3. resolve package dependencies
4. copy files
5. map supported paths
6. install packages
7. write provenance

Do not turn it into a generalized package manager.

---

# Example consumer

The example consumer must behave like an external project.

Never import registry component implementations from Shelf workspace packages.

Components must enter the consumer through `shelf add`.

If monorepo aliases are required to make the example work, the distribution model is not proven.

---

# Components

Before adding a component:

1. confirm it is required
2. check whether Base UI provides the behavior
3. check whether Shelf already provides the concept
4. keep the API small
5. add meaningful Storybook stories
6. add meaningful behavioral tests
7. add registry metadata

Do not add components to make the catalog look complete.

---

# Icons

Copied code imports icons only from the Shelf `icons` item:

```ts
import { CloseIcon } from "../icons/icons"; // registry component
import { CloseIcon } from "../../components/icons/icons"; // registry block
import { CloseIcon } from "@/components/ui/icons"; // apps
```

List `icons` in `shelfDependencies` of any item that uses it.

Never import `lucide-react` directly in registry items, demos, or blocks.

Users swap the icon library by editing one file.

If an icon is missing, add one wrapper to `registry/components/icons/icons.tsx`, named by meaning (`CloseIcon`, not `XIcon`), then reinstall `icons` in the apps.

Site-only chrome that users never copy may use `lucide-react`.

Lint enforces this.

---

# Composition

Prefer composition over large prop APIs.

Good:

```tsx
<Dialog.Root>
  <Dialog.Trigger />
  <Dialog.Content />
</Dialog.Root>
```

Avoid giant configuration components.

Avoid unnecessary abstraction before repetition exists.

---

# Storybook

Every component must have useful canonical stories.

Stories are not optional documentation.

They are inputs to:

- development
- documentation
- testing
- accessibility
- Figma compilation
- future visual regression
- agent examples

Do not generate meaningless exhaustive story combinations.

---

# Testing

Test Shelf behavior and integration boundaries.

Do not recreate Base UI's entire upstream test suite.

Prefer behavioral tests over implementation-detail tests.

Do not create tests purely for coverage numbers.

---

# Accessibility

Accessibility is required.

Use Base UI's accessibility behavior correctly.

Ensure Shelf composition does not break it.

Include accessibility validation in the repo's Storybook tests.

---

# `shelf check`

`shelf check` validates only what Shelf controls:

- config
- provenance
- Shelf and package dependencies of installed items
- imports in installed files

Do not make it run the consumer's TypeScript, lint, format, tests, Storybook, or build. Those belong to the project.

The repo's own `bun run check` runs TypeScript, lint, format, tests, and Storybook with accessibility.

Make failures actionable.

Agents should be able to read the output and fix problems without requiring human interpretation.

---

# Figma architecture

Shelf owns its code-to-Figma pipeline.

Do not depend permanently on an external synchronization service.

The architecture is:

```text
React
→ Storybook
→ Shelf Capture
→ Shelf Design IR
→ Shelf Figma Plugin
→ Native Figma
```

React remains canonical.

Do not create a public Shelf component DSL for Figma.

---

# Figma capture

Capture should operate on real rendered Storybook output.

Start with only the subset required for Shelf components.

Initial support can include:

```text
bounds
flex layout
padding
gap
background
border
radius
text
typography
SVG
opacity
shadow
nested Shelf identity
```

Do not attempt to support arbitrary websites.

---

# Shelf Design IR

The Design IR is internal compiler output.

Keep it small.

Initial node types may include:

```text
Frame
Text
Vector
Image
ComponentInstance
```

Do not expose the IR as the way developers author Shelf components.

---

# Figma semantic identity

Preserve known Shelf component identity wherever possible.

Do not flatten a nested Shelf Icon into unrelated vector geometry if it can remain an instance.

It is acceptable to use capture-only DOM annotations to preserve identity.

These annotations must not affect runtime behavior.

---

# Figma plugin

The initial plugin should be tiny.

The first goal is:

> Compile Button into a native Figma component that a designer genuinely wants to use.

Support only what is required for this.

Do not build a complete design-system management UI in the first pass.

---

# Figma quality bar

A generated component should have:

- clean hierarchy
- meaningful names
- Auto Layout
- correct resizing
- useful variants
- useful component properties
- semantic variables
- nested instances where appropriate

Pixel-perfect visual similarity is not enough.

Designer usability is the acceptance test.

---

# Designers

Do not treat designers as passive output consumers.

Designers must remain able to:

- compose with production components
- explore freely
- detach/copy components
- create new concepts
- redesign existing concepts

Production component masters follow code.

Exploration remains normal Figma work.

---

# Agents

Before creating reusable UI:

1. search Shelf
2. prefer a template
3. otherwise prefer a block
4. otherwise prefer a pattern
5. otherwise prefer a component
6. create a new abstraction only when necessary

Do not reinvent existing Shelf concepts.

---

# Website

The website must use Shelf components.

Do not create separate UI implementations specifically for docs.

The website should eventually expose:

- components
- patterns
- blocks
- themes
- Figma
- agents

but V0 website work should follow the core component/distribution workflow, not precede it.

---

# Visual regression

Visual regression is future work.

Do not implement it during the first vertical slice.

The future design should support:

- deterministic captures
- structured differences
- human review
- agent feedback

Do not build subjective visual scoring.

---

# Company-specific code

Shelf core must remain generic.

Do not add private/company-specific:

- names
- branding
- tokens
- components
- product concepts
- infrastructure assumptions

to generic Shelf packages.

---

# Explicit V0 non-goals

Do not build:

- Shelf cloud
- accounts
- authentication
- organization management
- analytics dashboards
- multi-framework support
- Tailwind support
- multiple primitive libraries
- plugin marketplace
- custom CSS compiler
- custom accessible primitive library
- AI UI generator
- custom merge engine
- arbitrary HTML → Figma
- large component catalog

unless explicitly requested.

---

# Build order

Follow this order unless blocked:

1. Bun workspace
2. TypeScript
3. minimal StyleX integration
4. minimal semantic foundations
5. Button
6. Button stories
7. minimal Shelf registry
8. `shelf add button`
9. external-style example consumer
10. provenance
11. `shelf check`
12. Dialog using Base UI
13. Dialog stories/tests
14. local consumer modification test
15. tiny Shelf Design IR
16. Button Storybook capture
17. tiny Figma plugin
18. generated native Button
19. designer evaluation
20. real product dogfood

Do not skip ahead because later roadmap ideas are interesting.

---

# First definition of done

The first engineering milestone is complete when:

```bash
bunx @shelfui/cli add button
```

from the example consumer:

1. resolves Button
2. copies normal React + StyleX source
3. installs required package dependencies
4. records provenance
5. allows local source modification

and:

```bash
shelf check
```

passes afterward.

Then implement Dialog.

---

# First Figma definition of done

The Figma spike is complete when:

```text
React Button
→ Storybook render
→ Shelf capture
→ Shelf Design IR
→ Shelf Figma Plugin
→ Native Figma Button
```

produces a component with:

- clean layer structure
- Auto Layout
- useful properties
- semantic styling
- correct resizing

and a real designer says the generated component is good enough to use in production design work.

Do not expand the compiler before reaching this bar.

---

# Validation

After meaningful work, run:

```bash
bun run check
```

plus relevant tests/builds.

Do not disable validation to get a green result.

Fix the underlying issue.

---

# Decision rule

Before adding infrastructure, ask:

> Does this directly improve the current Shelf → consumer → local ownership workflow or the React → Figma designer workflow?

If no:

defer it.

---

# Quality bar

Shelf should feel:

- fast
- small
- obvious
- transparent
- polished
- predictable
- composable
- easy to modify
- easy to remove
- excellent for engineers
- excellent for designers
- excellent for agents

Prefer simple, durable implementation over clever infrastructure.

---

# Cursor: first task

When starting this repository from zero:

1. Read `PROJECT.md`.
2. Read this file fully.
3. Inspect the repository.
4. Verify current Bun, StyleX, Base UI, and Storybook setup requirements before choosing configuration details.
5. Do not implement the entire roadmap.

Start with only:

```text
Bun workspace
TypeScript
StyleX
minimal foundations
Button
Button stories
registry
shelf add button
external-style consumer
provenance
shelf check
```

Before implementation, produce a concise proposed file tree and execution plan.

Then implement incrementally.

Run validation after each major milestone.

Stop after the Button vertical slice is working end-to-end and report:

- what was implemented
- exact commands to run
- architectural compromises
- remaining limitations

Do not continue automatically into Figma or additional components until the Button distribution workflow is proven.

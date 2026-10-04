# Figma evaluation

The acceptance test from `PROJECT.md` section 30:

> Can a designer use this component naturally and forget that it was generated from React?

Automated tests in `src/plugin/apply.test.ts` run against an in-memory Figma (`fake-figma.ts`). They prove
structure. They cannot prove that the result feels right in Figma. The manual column below is the
part that needs a real file and a real designer.

## How to run an evaluation

1. `bun run storybook:build`, then `bun run registry:build`.
2. `bun run registry:serve` (or deploy `dist/registry`).
3. In a blank Figma file, run the Shelf plugin (`bun run figma:build`, then import `packages/cli/dist/figma/manifest.json`).
4. Connect the registry URL and press Sync.
5. Fill in the table for the component under test. Record the date, the revision, and the person.
6. For the designer verdict, ask them to build one real screen with the component and answer the last section.

## Checklist

Automated means a test already covers it. Manual means a person must look at the file.

| Criterion | What good looks like | Automated | Manual |
| --- | --- | --- | --- |
| Layer hierarchy | No wrapper frames that do nothing. Depth matches the DOM only where the DOM has meaning. | No | Open the layers panel. |
| Layer names | `Label`, `Icon`, not `div` or `Frame 12`. | Names come from capture; `apply.test.ts` checks variant names. | Read the panel. |
| Auto Layout | Every frame with children has direction, gap, padding, and alignment. | Yes: direction, gap, padding, grid. | Resize the component and check it behaves. |
| Resizing | Hug, fill, and fixed match the code. A label change grows the button. | Sizing mode is applied. | Change the label text on an instance. |
| Variants | Properties are named like the props (`Variant`, `Size`, `State`). No unused combinations. | Yes: names and `omit`. | Open the variant picker. |
| Component properties | `Label` (text), `Icon` (swap), `Show Icon` (boolean). | Yes. | Use each in an instance. |
| Variables | Fills, radii, spacing, and sizes bind to variables, not raw values. | Yes: bound fields are listed. | Switch the Light and Dark modes. |
| Nested instances | An Icon is an instance of the icon component, not loose vectors. | Yes. | Swap the icon on an instance. |
| Re-sync | A second sync keeps instances, overrides, and detached copies. | Yes: ids are stable and designer work is untouched. | Edit code, sync, check a real instance. |
| Description and docs link | The set links to the docs and shows the install command. | Yes. | Click the link. |

## Records

Fill in one block per run. An empty block means that component has not been evaluated.

### Button

- Date:
- Registry revision:
- Evaluated by:
- Result per criterion (pass, fail, note):
- Defects filed:
- Designer verdict: _good enough for production design work, yes or no, and why_

### Dialog

- Date:
- Registry revision:
- Evaluated by:
- Result per criterion:
- Defects filed:

### Input

- Date:
- Registry revision:
- Evaluated by:
- Result per criterion:
- Defects filed:

## Designer questions

Ask after they have built a real screen.

1. Did you detach the component at any point? Why?
2. Which property or variant did you expect and not find?
3. Which did you find and never use?
4. Did resizing behave the way you expected?
5. Would you use this library for your next real design? What blocks you?

## Components outside the library

Components are left out of the Figma library on purpose, with a reason, in `FIGMA_EXEMPT` in
`scripts/verify/audit.ts`. `bun run audit` fails when a component is neither in the library nor
listed there.

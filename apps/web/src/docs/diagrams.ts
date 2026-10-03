export const models = {
  title: "Three models",
  label:
    "Three models. A shared package is consistent, but its API is the ceiling. Copy and own is fast and yours, but disconnected from where it came from. Shelf is fast and yours, and tracked against the registry.",
  art: `
SHARED PACKAGE             COPY AND OWN               **SHELF**

┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
│   design system    │     │    a component     │     │     **a registry**     │
└──────────┬─────────┘     └──────────┬─────────┘     └──────────┬─────────┘
           │ install                  │ copy                     │ **shelf add**
           ▼                          ▼                          ▼
┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
│    your product    │     │    your source     │     │    your source     │
└────────────────────┘     └────────────────────┘     └────────────────────┘

  + consistent               + fast and yours           + fast and yours
  − its API is the           − disconnected from        + **tracked against**
    ceiling                    where it came from         **the registry**
`,
};

export const registry = {
  title: "one registry, every product",
  label:
    "One registry holds button, dialog, and foundations with their revisions. Three products add from it with shelf add; each records what it installed, and one has changed its button locally.",
  art: `
                   ┌────────────────────────────┐
                   │ **registry **                  │
                   │                            │
                   │ button        rev f79cc3   │
                   │ dialog        rev df3f50   │
                   │ foundations   rev c8d698   │
                   └──────────────┬─────────────┘
                                  │ **shelf add**
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ **checkout**         │    │ **dashboard**        │    │ **admin**            │
│                  │    │                  │    │                  │
│ button       ✓   │    │ button       **~**   │    │ button       ✓   │
│ dialog       ✓   │    │ dialog       ✓   │    │ foundations  ✓   │
│ foundations  ✓   │    │ foundations  ✓   │    │                  │
└──────────────────┘    └──────────────────┘    └──────────────────┘

✓ matches what was installed      **~** changed locally
`,
};

export const threeWay = {
  title: "three versions of every file",
  label:
    "BASE is what you installed. LOCAL is what you changed. UPSTREAM is what the registry has now.",
  art: `
               ┌──────────────────────┐
               │ **BASE**                 │
               │ what you installed   │
               └───────────┬──────────┘
            ┌──────────────┴──────────────┐
            ▼                             ▼
┌──────────────────────┐      ┌──────────────────────┐
│ **LOCAL**                │      │ **UPSTREAM**             │
│ what you changed     │      │ what the registry    │
└──────────────────────┘      │ has now              │
                              └──────────────────────┘
`,
};

export const recovery = {
  title: "where BASE comes from",
  label:
    "Shelf looks for the bytes whose hash matches baseHash in the lock: first the file itself, then your git history, then the registry revision rebuilt the way add wrote it. If none match, it says it can't recover BASE and why.",
  art: `
┌────────────────────────────┐
│ **.shelf/lock.json**           │
│ revision + baseHash        │
└──────────────┬─────────────┘
               │ which bytes hash to baseHash?
               ▼
┌────────────────────────────┐
│ 1  the file itself         ├───────▶ it, if you didn't change it
└──────────────┬─────────────┘
               │ no
               ▼
┌────────────────────────────┐
│ 2  your git history        ├───────▶ the commit after shelf add, exact
└──────────────┬─────────────┘
               │ never committed
               ▼
┌────────────────────────────┐
│ 3  the registry revision,  ├───────▶ rebuilt, then checked
│    rebuilt the way add was │
└──────────────┬─────────────┘
               │ no match
               ▼
    **Can't recover BASE**, and why
`,
};

export const agentLoop = {
  title: "the agent loop",
  label:
    "The agent loop: search, add, read, change, shelf check, and ship. A failing check loops back to change.",
  art: `
┌────────┐   ┌─────┐   ┌──────┐   ┌────────┐   ┌─────────────┐   ┌──────┐
│ search ├──▶│ add ├──▶│ read ├──▶│ change ├──▶│ **shelf check** ├──▶│ ship │
└────────┘   └─────┘   └──────┘   └────▲───┘   └──────┬──────┘   └──────┘
                                       │              │
                                       └──── fix ─────┘
`,
};

export const learnLoop = {
  title: "use, learn, standardize",
  label:
    "A product need is built locally, shipped, and learned from. When another product needs it, it is contributed back as a shared pattern.",
  art: `
┌──────────────┐   ┌───────────────┐   ┌──────┐   ┌───────┐
│ product need ├──▶│ build locally ├──▶│ ship ├──▶│ learn │
└──────────────┘   └───────────────┘   └──────┘   └───┬───┘
                                                      │ another product needs it
                                                      │
┌────────────────┐   ┌────────────┐
│ **shared pattern** │◀──┤ contribute ├───────────────────┘
└────────────────┘   └────────────┘
`,
};

export const figma = {
  title: "react to figma",
  label:
    "React, then Storybook, then Shelf Capture, then Shelf Design IR, then the Figma plugin, then native Figma components.",
  art: `
┌───────────────────┐
│ **React **            │   production source of truth
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Storybook         │   the supported states
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Shelf Capture     │   reads the rendered output
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Shelf Design IR   │   frames, text, vectors, instances
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Figma plugin      │   builds native components
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ **Native Figma**      │   Auto Layout, variants, variables
└───────────────────┘
`,
};

export const agentSession = {
  title: "terminal",
  label:
    "An agent adds a confirm step: it searches Shelf, adds Alert Dialog, edits it, and shelf check passes with one file modified locally.",
  art: `
**> Add a confirm step before deleting a project.**

**$ shelf search dialog**
  alert-dialog  component   A modal that asks the user to confirm or cancel; ...
  dialog        component   A modal window composed from Root, Trigger, ...

**$ shelf add alert-dialog**
  ✓ resolved alert-dialog, foundations, utils
  ✓ added 1 file
  ✓ recorded provenance in .shelf/lock.json

  **Alert Dialog is now yours.**
    src/components/ui/alert-dialog.tsx

**~ edits src/components/ui/alert-dialog.tsx**

**$ shelf check**
  ✓ config       registry ../../registry
  ✓ provenance   6 items, 9 files, 1 modified locally
      ~ src/components/ui/alert-dialog.tsx (alert-dialog, modified locally)
  ✓ dependencies 5 packages declared, Shelf dependencies installed
  ✓ imports      11 local imports resolve

  **✓ All checks passed**
`,
};

export const fileTree = {
  title: "after shelf add button dialog",
  label:
    "After shelf add button dialog: components in src/components/ui, foundations in src/styles/shelf, helpers in src/lib/shelf, and provenance in .shelf.",
  art: `
src/
├── components/ui/
│   ├── **button.tsx**
│   ├── **dialog.tsx**
│   └── icons.tsx
├── styles/shelf/
│   ├── tokens.stylex.ts
│   ├── conditions.stylex.ts
│   ├── themes.ts
│   └── fonts.css
└── lib/shelf/
    └── utils.ts
**.shelf/**
├── lock.json          revision and hash of every file
└── base/              the files exactly as installed
shelf.config.json
`,
};

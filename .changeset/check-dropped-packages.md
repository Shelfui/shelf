---
"@shelfui/cli": patch
---

`shelf check` no longer requires a package that a locally edited item stopped importing, so swapping `lucide-react` for another icon library in `icons.tsx` passes without keeping `lucide-react` installed.

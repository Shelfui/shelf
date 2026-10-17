# @shelfui/cli

## 0.2.0

### Minor Changes

- 7203045: `shelf search` ranks results (a name match beats a keyword, a keyword beats the description) and matches "confirmation" to "confirm". Registry entries can add `keywords`, `useWhen`, `avoidWhen`, and `related`, which `search --json`, `docs`, and `llms.txt` show. Registries can publish `pattern` and `template` items, installed to the new `paths.patterns` and `paths.templates` (defaults `src/components/patterns` and `src/components/templates`).

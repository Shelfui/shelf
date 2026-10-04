# Dogfood log

`PROJECT.md` section 46: use Shelf in a real product, and let that decide what to build next.

`examples/acme` is a demo. It has never lived through an upstream change. This file is for a product
that ships to users.

## The product

- Product:
- Repository:
- Owner:
- Started:
- Items installed (`shelf status`):
- Shelf revision at start:

Pick a product that has at least one screen being built or changed during the run, so the log
reflects real work and not a rehearsal. Run it for two weeks.

## Rules for the run

1. Install with `shelf add`. Never copy files by hand.
2. Commit right after every `shelf add` and `shelf update`.
3. Edit installed files freely. Note each edit that you wished you did not have to make.
4. Run `shelf update` at least once per week, whether or not you expect changes.
5. Search Shelf first (`shelf search`, `shelf docs`) before building any new UI. Note each miss.
6. Log friction here the moment it happens, with the command and the output.

## Friction log

One entry per problem. Newest first.

| Date | Area | What happened | Command and output | Fix or follow-up |
| --- | --- | --- | --- | --- |
| | | | | |

Areas: `cli`, `registry`, `provenance`, `update`, `component`, `pattern`, `figma`, `agent`, `docs`.

## Found by automated replay (not from the product yet)

These came from the replay tests and the smoke script. They are real, but a product will find more.

- `shelf diff --local` and `shelf update` need BASE. With a source registry (a plain directory
  without `shelf build`), BASE only exists in the project's git history. Without a commit right
  after `shelf add`, both fail with "Can't recover BASE". The error says so, and the docs
  recommend committing, but `shelf add` itself does not remind you. Consider printing one line
  after `add`: "Commit now to keep an exact BASE."
- `shelf update` reports a package range change (`icons now needs lucide-react@^1.52.0`) and
  stops there. The user has to run the install command. That is intentional, but a product should
  say whether it is annoying in practice.

## Questions the run must answer

- Did any component need a prop or variant it did not have? Which, and did a local edit solve it?
- How many local edits are there after two weeks, and how many survived `shelf update` cleanly?
- Did a conflict happen? Was the output enough to resolve it without help?
- Which pattern or block was missing?
- Did a coding agent find and use Shelf without being told how?
- Did a designer use the Figma library? What did they detach?

## Result

Fill in at the end. State plainly whether the ownership model worked for this product, and what
changes before the next product.

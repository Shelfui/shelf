// Test data for the streaming tests. Not part of the installed item.

/** About 20 KB of the kind of answer a model writes: prose, lists, code, a table, a quote. */
const section = (n: number) =>
  [
    `## Section ${n}`,
    "",
    `This is paragraph ${n} with **bold text**, *emphasis*, \`inline code\`, and a [link](https://example.com/${n}).`,
    "It continues for a few more words so that the line is long enough to look like real prose.",
    "",
    `- First point about item ${n}`,
    `- Second point with \`code\``,
    `- Third point with **strong** text`,
    "",
    "```ts",
    `export function example${n}(input: number): number {`,
    "  return input * 2;",
    "}",
    "```",
    "",
    "| Name | Value |",
    "| ---- | ----- |",
    `| a${n} | ${n} |`,
    "",
    `> A short quote for section ${n}.`,
    "",
  ].join("\n");

export function fixture(): string {
  let text = "";
  for (let n = 1; text.length < 20_000; n++) text += section(n);
  return text;
}

/** Cuts the text into pieces of 1 to 6 characters, the way tokens arrive. */
export function tokens(text: string): string[] {
  const pieces: string[] = [];
  for (let at = 0, size = 1; at < text.length; at += size, size = (size % 6) + 1) {
    pieces.push(text.slice(at, at + size));
  }
  return pieces;
}

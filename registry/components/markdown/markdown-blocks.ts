import { Lexer } from "marked";
import remend from "remend";

/**
 * Splits streaming markdown into top-level blocks, so only the last one re-renders per token.
 *
 * The text only ever grows, so every block but the last few is settled. Parsing starts after
 * the settled blocks instead of from the top, which keeps the cost per token flat however long
 * the response gets.
 */
export interface BlockSplitter {
  /** The blocks of `text`. Unchanged blocks are the same strings as last time. */
  split(text: string): string[];
}

/** A block followed by this many more is final: nothing later in the text can merge into it. */
const SETTLED_BEHIND = 2;

/**
 * Link reference definitions (`[a]: url`) and footnotes can sit far from where they are used,
 * so a document that has them is parsed whole.
 */
const REFERENCES = /^ {0,3}\[[^\]\n]+\]:[ \t]*\S|\[\^[^\]\n]+\]/m;

export function createBlockSplitter(): BlockSplitter {
  let previous: string[] = [];

  return {
    split(text) {
      if (REFERENCES.test(text)) {
        previous = [text];
        return previous;
      }

      // Keep the settled blocks if the new text still starts with them.
      let settled = Math.max(0, previous.length - SETTLED_BEHIND);
      let offset = 0;
      for (let i = 0; i < settled; i++) {
        const block = previous[i]!;
        if (!text.startsWith(block, offset)) {
          settled = i;
          break;
        }
        offset += block.length;
      }

      const next = previous.slice(0, settled);
      for (const block of lexBlocks(text.slice(offset))) next.push(block);
      previous = next;
      return next;
    },
  };
}

/** Top-level blocks of `text`, with blank lines kept on the block before them. */
export function lexBlocks(text: string): string[] {
  if (!text) return [];
  const blocks: string[] = [];
  for (const token of new Lexer({ gfm: true }).blockTokens(text)) {
    // Copy: a slice would keep the whole message text alive for as long as one block does.
    const raw = (" " + token.raw).slice(1);
    if (token.type === "space" && blocks.length > 0) blocks[blocks.length - 1] += raw;
    else blocks.push(raw);
  }
  // The lexer can normalize trailing whitespace. Blocks must always add back up to the text.
  const joined = blocks.join("");
  if (joined !== text) {
    if (text.startsWith(joined) && blocks.length > 0)
      blocks[blocks.length - 1] += text.slice(joined.length);
    else return [text];
  }
  return blocks;
}

/** Completes unfinished syntax (`**bold`, `` `code ``, `[link](`) so a half-streamed block still reads. */
export function heal(block: string): string {
  return remend(block);
}

/** `true` when `block` opens a code fence it has not closed yet. */
export function endsInsideFence(block: string): boolean {
  let fence: string | undefined;
  for (const line of block.split("\n")) {
    const match = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (!match) continue;
    const marker = match[1]!;
    if (!fence) fence = marker;
    else if (marker[0] === fence[0] && marker.length >= fence.length && line.trim() === marker)
      fence = undefined;
  }
  return fence !== undefined;
}

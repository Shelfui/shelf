import { describe, expect, test } from "bun:test";
import { createBlockSplitter, heal, lexBlocks } from "./stream-blocks";
import { fixture, tokens } from "./stream-fixture.test";

const TEXT = fixture();

describe("streaming a 20 KB answer", () => {
  test("the splitter agrees with parsing the whole text at the end", () => {
    const splitter = createBlockSplitter();
    let received = "";
    let blocks: string[] = [];
    for (const piece of tokens(TEXT)) {
      received += piece;
      blocks = splitter.split(received);
    }
    expect(blocks.join("")).toBe(TEXT);
    expect(blocks).toEqual(lexBlocks(TEXT));
  });

  test("each token costs well under a frame, so streaming never blocks input", () => {
    const splitter = createBlockSplitter();
    const pieces = tokens(TEXT);
    let received = "";
    let slowest = 0;
    let total = 0;
    for (const piece of pieces) {
      received += piece;
      const began = performance.now();
      const blocks = splitter.split(received);
      // The tail is healed on every token too, so it is part of the cost.
      heal(blocks.at(-1) ?? "");
      const took = performance.now() - began;
      total += took;
      slowest = Math.max(slowest, took);
    }
    // Budgets are loose on purpose: they catch a return to re-parsing everything per token
    // (which takes seconds), not machine-to-machine noise.
    expect(slowest).toBeLessThan(16);
    expect(total / pieces.length).toBeLessThan(1);
  });

  test("settled blocks keep their identity, so only the last blocks re-render", () => {
    const splitter = createBlockSplitter();
    let received = "";
    let previous: string[] = [];
    let changedSettled = 0;
    for (const piece of tokens(TEXT)) {
      received += piece;
      const blocks = splitter.split(received);
      for (let i = 0; i < previous.length - 2; i++) {
        if (blocks[i] !== previous[i]) changedSettled++;
      }
      previous = blocks;
    }
    expect(changedSettled).toBe(0);
  });
});

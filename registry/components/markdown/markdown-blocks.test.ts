import { describe, expect, test } from "bun:test";
import { createBlockSplitter, endsInsideFence, heal, lexBlocks } from "./markdown-blocks";
import { safeUrl } from "./markdown-url";

const DOC = "# Title\n\nFirst paragraph.\n\n- a\n- b\n\n```ts\nconst a = 1;\n```\n\nLast one.";

describe("lexBlocks", () => {
  test("splits at top-level blocks and loses no text", () => {
    const blocks = lexBlocks(DOC);
    expect(blocks.length).toBe(5);
    expect(blocks.join("")).toBe(DOC);
  });

  test("keeps a code fence with blank lines inside as one block", () => {
    expect(lexBlocks("```\na\n\nb\n```\n\nafter")).toEqual(["```\na\n\nb\n```\n\n", "after"]);
  });
});

describe("createBlockSplitter", () => {
  test("streaming one character at a time matches parsing the whole text", () => {
    const splitter = createBlockSplitter();
    for (let i = 1; i <= DOC.length; i++) {
      const text = DOC.slice(0, i);
      expect(splitter.split(text).join("")).toBe(text);
    }
    expect(splitter.split(DOC)).toEqual(lexBlocks(DOC));
  });

  test("settled blocks keep their identity between calls", () => {
    const splitter = createBlockSplitter();
    const a = splitter.split(DOC.slice(0, 60));
    const b = splitter.split(DOC);
    expect(b[0]).toBe(a[0]);
  });

  test("recovers when the text is replaced instead of extended", () => {
    const splitter = createBlockSplitter();
    splitter.split(DOC);
    expect(splitter.split("# Other\n\ntext").join("")).toBe("# Other\n\ntext");
  });

  test("a document with link definitions is one block", () => {
    const text = "See [docs][d].\n\nMore.\n\n[d]: https://example.com";
    expect(createBlockSplitter().split(text)).toEqual([text]);
  });
});

describe("heal", () => {
  test("closes unfinished emphasis and code", () => {
    expect(heal("Some **bold")).toBe("Some **bold**");
    expect(heal("Run `ls")).toBe("Run `ls`");
  });
});

describe("endsInsideFence", () => {
  test("is true only while a fence is open", () => {
    expect(endsInsideFence("```ts\nconst a")).toBe(true);
    expect(endsInsideFence("```ts\nconst a\n```")).toBe(false);
    expect(endsInsideFence("plain")).toBe(false);
  });
});

describe("safeUrl", () => {
  test("allows web, mail, and relative links", () => {
    expect(safeUrl("https://example.com/a?b=1")).toBe("https://example.com/a?b=1");
    expect(safeUrl("mailto:hi@example.com")).toBe("mailto:hi@example.com");
    expect(safeUrl("/docs")).toBe("/docs");
    expect(safeUrl("#section")).toBe("#section");
  });

  test("refuses script and data URLs, including disguised ones", () => {
    expect(safeUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeUrl("JaVaScRiPt:alert(1)")).toBeUndefined();
    expect(safeUrl("java\nscript:alert(1)")).toBeUndefined();
    expect(safeUrl(" \tjavascript:alert(1)")).toBeUndefined();
    expect(safeUrl("data:text/html;base64,AAAA")).toBeUndefined();
    expect(safeUrl("streamdown:incomplete-link")).toBeUndefined();
    expect(safeUrl("")).toBeUndefined();
  });
});

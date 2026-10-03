import report from "./verify.json";

interface Weight {
  js: number;
  css: number;
}

/** What `bun run verify` measured for one registry item. */
export interface Verification {
  size: { own: Weight; total: Weight };
  stories: { total: number; interactive: number };
  /** Storybook's id for the first story, such as `components-button--default`. */
  storyId: string | null;
  renderTested: boolean;
  doctor: { errors: number; warnings: number };
  compiler: { compiled: number; failed: number } | null;
}

/** Which tool proved a check, so the badge can show its mark. */
export type CheckKind = "axe" | "storybook" | "react" | "doctor";

export interface Check {
  kind: CheckKind;
  label: string;
  /** The full sentence, for the page. */
  detail: string;
  /** A few words, for the badge's card. */
  value: string;
}

/** The measurements for `name`, or undefined for an item that has none. */
export function verificationFor(name: string): Verification | undefined {
  const items: Record<string, Verification> = report.items;
  return items[name];
}

/** Gzipped bytes as kB, with one decimal under 10 kB. */
export function formatSize(bytes: number): string {
  const kilobytes = bytes / 1000;
  return `${kilobytes < 10 ? kilobytes.toFixed(1) : Math.round(kilobytes)} kB`;
}

export const weigh = (weight: Weight) => weight.js + weight.css;

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** The checks that passed. One that did not is left out, so everything listed was proven. */
export function checksFor({ stories, renderTested, compiler, doctor }: Verification): Check[] {
  const checks: Check[] = [];
  if (stories.total > 0) {
    checks.push({
      kind: "axe",
      label: "Accessibility",
      detail: `Axe passes on ${count(stories.total, "story", "stories")}`,
      value: `${count(stories.total, "story", "stories")} pass`,
    });
  }
  if (stories.interactive > 0) {
    checks.push({
      kind: "storybook",
      label: "Behavior",
      detail: `${count(stories.interactive, "interaction test", "interaction tests")} in Storybook`,
      value: count(stories.interactive, "test", "tests"),
    });
  }
  if (renderTested) {
    checks.push({
      kind: "react",
      label: "Rendering",
      detail: "Parent re-renders skip its consumers",
      value: "Stable",
    });
  }
  if (compiler && compiler.failed === 0) {
    checks.push({
      kind: "react",
      label: "React Compiler",
      detail: "Compiles with React Compiler",
      value: "Optimized",
    });
  }
  if (doctor.errors + doctor.warnings === 0) {
    checks.push({
      kind: "doctor",
      label: "React Doctor",
      detail: "React Doctor finds nothing",
      value: "No issues",
    });
  }
  return checks;
}

/** What the badge's hover card shows, formatted on the server so the client never loads the report. */
export interface Summary {
  own: string;
  total: string;
  checks: { kind: CheckKind; label: string; value: string }[];
}

export function summaryFor(verification: Verification): Summary {
  return {
    own: formatSize(weigh(verification.size.own)),
    total: formatSize(weigh(verification.size.total)),
    checks: checksFor(verification).map(({ kind, label, value }) => ({ kind, label, value })),
  };
}

/** Gzipped bytes of what an item adds to a production bundle, excluding React. */
export interface Weight {
  js: number;
  css: number;
}

export interface Size {
  /** The item's own files. Other Shelf items and packages stay external. */
  own: Weight;
  /** The item with the Shelf items and packages it imports. */
  total: Weight;
}

export interface Verification {
  size: Size;
  /** Packages listed in the item's `dependencies`. */
  packages: number;
  shelfDependencies: number;
  stories: { total: number; interactive: number };
  /** Storybook's id for the first story, to link to it. Null when the item has no stories. */
  storyId: string | null;
  /** The item creates a React context, so its consumers can re-render with it. */
  providesContext: boolean;
  /** A `*.perf.tsx` test proves a parent re-render does not re-render those consumers. */
  renderTested: boolean;
  /** React Doctor findings in the item's files. */
  doctor: { errors: number; warnings: number };
  /** Functions React Compiler compiled, and ones it had to skip. Null when the item has none. */
  compiler: { compiled: number; failed: number } | null;
}

/** `dist/verify.json`: what `shelf build --verify` publishes next to the registry. */
export interface VerifyReport {
  version: 1;
  items: Record<string, Verification>;
}

/** `scripts/verify/baseline.json`: the committed size budget, in gzipped bytes per item. */
export interface Baseline {
  items: Record<string, { own: number; total: number }>;
}
